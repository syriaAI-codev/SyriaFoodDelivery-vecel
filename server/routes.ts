import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import {
  insertUserSchema,
  insertAddressSchema,
  insertOrderSchema,
  insertOrderItemSchema
} from '@shared/schema';
import { formatZodError } from './middleware/error-handler';
import checkRole from './middleware/check-role';
import session from 'express-session';
import MemoryStore from 'memorystore';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { WebSocketServer, WebSocket } from 'ws';
import adminRouter from './routes/admin';
import { supabaseAdmin } from './supabase';

// Session store for tracking user sessions
const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time order tracking
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws' // Specify a path to avoid conflict with Vite's WebSocket
  });
  
  // Add custom properties to WebSocket objects
  interface CustomWebSocket extends WebSocket {
    userId?: number;
    orderId?: number;
    role?: 'customer' | 'restaurant' | 'delivery' | 'admin';
    isAlive?: boolean;
    restaurantId?: number;
  }
  
  // Ping all clients every 30 seconds to detect dead connections
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      const customWs = ws as CustomWebSocket;
      
      if (customWs.isAlive === false) {
        console.log('Terminating inactive WebSocket connection');
        return ws.terminate();
      }
      
      customWs.isAlive = false;
      try {
        ws.ping();
      } catch (err) {
        console.error('Error pinging client:', err);
        ws.terminate();
      }
    });
  }, 30000);
  
  // Clean up interval on server close
  wss.on('close', () => {
    clearInterval(pingInterval);
  });
  
  wss.on('connection', (ws: WebSocket, req) => {
    const customWs = ws as CustomWebSocket;
    console.log('WebSocket client connected from:', req.socket.remoteAddress);
    
    // Mark the connection as alive
    customWs.isAlive = true;
    
    // Handle pong responses
    ws.on('pong', () => {
      customWs.isAlive = true;
    });
    
    ws.on('message', (messageEvent: any) => {
      try {
        // Convert buffer/string/arraybuffer to string
        let message: string;
        if (typeof messageEvent === 'string') {
          message = messageEvent;
        } else if (messageEvent instanceof Buffer) {
          message = messageEvent.toString();
        } else if (messageEvent instanceof ArrayBuffer) {
          message = new TextDecoder().decode(messageEvent);
        } else if (messageEvent.data) {
          // Handle WebSocket message event
          message = messageEvent.data.toString();
        } else {
          message = String(messageEvent);
        }
        
        const data = JSON.parse(message);
        
        // Handle ping messages to keep connection alive
        if (data.type === 'ping') {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          }
          return;
        }
        
        // Handle client identification
        if (data.type === 'identify') {
          if (data.userId && data.role) {
            customWs.userId = data.userId;
            customWs.role = data.role;
            
            // Store restaurant ID for restaurant owners to receive order notifications
            if (data.role === 'restaurant' && data.restaurantId) {
              customWs.restaurantId = data.restaurantId;
            }
            
            console.log(`Client identified: User #${data.userId} as ${data.role}`);
            
            // Send confirmation
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ 
                type: 'identified', 
                userId: data.userId,
                role: data.role,
                timestamp: new Date().toISOString()
              }));
            }
            
            // If this is a restaurant owner, send any pending orders
            if (data.role === 'restaurant' && data.restaurantId) {
              // This would fetch pending orders for this restaurant
              // and send them to the connected client
              // (implementation depends on storage interface)
            }
            
            // If this is a delivery person, send any assigned deliveries
            if (data.role === 'delivery') {
              // This would fetch assigned deliveries for this driver
              // and send them to the connected client
              // (implementation depends on storage interface)
            }
          }
          return;
        }
        
        // Handle order tracking subscription
        if (data.type === 'subscribe' && data.orderId) {
          customWs.orderId = data.orderId;
          console.log(`Client subscribed to order: ${data.orderId}`);
          
          // Send confirmation
          try {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ 
                type: 'subscribed', 
                orderId: data.orderId,
                timestamp: new Date().toISOString()
              }));
            }
          } catch (sendError) {
            console.error('Error sending subscription confirmation:', sendError);
          }
          
          // Send initial order state if needed
          storage.getOrder(data.orderId)
            .then(order => {
              if (order && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'initialState',
                  data: {
                    status: order.status,
                    driverLocation: order.driverLat && order.driverLng 
                      ? { lat: order.driverLat, lng: order.driverLng } 
                      : null,
                    updatedAt: order.updatedAt
                  }
                }));
              }
            })
            .catch(error => {
              console.error('Error fetching initial order state:', error);
            });
        }
        
        // Handle driver location update (from delivery person's app)
        if (data.type === 'updateDriverLocation' && data.orderId && data.lat && data.lng) {
          if (customWs.role === 'delivery') {
            // Update driver location in database
            storage.updateDriverLocation(data.orderId, data.lat, data.lng)
              .then(updatedOrder => {
                if (updatedOrder) {
                  // Broadcast location update to all clients subscribed to this order
                  broadcastOrderUpdate(data.orderId, {
                    type: 'driver_location_update',
                    orderId: data.orderId,
                    lat: data.lat,
                    lng: data.lng
                  });
                }
              })
              .catch(error => {
                console.error('Error updating driver location:', error);
              });
          } else {
            console.warn('Unauthorized attempt to update driver location');
          }
        }
      } catch (error: any) {
        console.error('WebSocket message error:', error.message || error);
      }
    });
    
    ws.on('error', (error: any) => {
      console.error('WebSocket error:', error.message || error);
    });
    
    ws.on('close', (code: number, reason: string) => {
      console.log(`WebSocket client disconnected: ${code} ${reason || ''}`);
    });
  });
  
  // Broadcast order updates to relevant clients
  const broadcastOrderUpdate = async (orderId: number, data: any) => {
    let sentCount = 0;
    
    try {
      // Get order details to determine restaurant and customer
      const order = await storage.getOrder(orderId);
      if (!order) {
        console.error(`Cannot broadcast update for non-existent order #${orderId}`);
        return;
      }
      
      const messageToSend = {
        ...data,
        timestamp: new Date().toISOString()
      };
      
      const messageString = JSON.stringify(messageToSend);
      
      // Send to all clients subscribed to this specific order
      wss.clients.forEach((client: WebSocket) => {
        const customClient = client as CustomWebSocket;
        if (customClient.orderId === orderId && client.readyState === WebSocket.OPEN) {
          try {
            client.send(messageString);
            sentCount++;
          } catch (error: any) {
            console.error('Error broadcasting to order subscriber:', error.message || error);
          }
        }
        
        // Notify customer if they're connected but not subscribed to this order
        if (customClient.userId === order.userId && 
            customClient.role === 'customer' && 
            !customClient.orderId &&
            client.readyState === WebSocket.OPEN) {
          try {
            client.send(JSON.stringify({
              type: 'order_update_notification',
              orderId: orderId,
              status: data.status || order.status,
              message: `طلبك رقم ${orderId} ${getStatusMessage(order.status)}`,
              timestamp: new Date().toISOString()
            }));
            sentCount++;
          } catch (error: any) {
            console.error('Error sending notification to customer:', error.message || error);
          }
        }
        
        // Notify restaurant owner if they're connected
        if (customClient.role === 'restaurant' && 
            customClient.restaurantId === order.restaurantId &&
            client.readyState === WebSocket.OPEN) {
          try {
            // Send a notification about the order update
            const restaurantMessage = data.type === 'new_order'
              ? {
                  type: 'new_order_notification',
                  orderId: orderId,
                  message: 'لديك طلب جديد!',
                  timestamp: new Date().toISOString()
                }
              : {
                  type: 'order_update_notification',
                  orderId: orderId,
                  status: data.status || order.status,
                  message: `تم تحديث حالة الطلب رقم ${orderId} إلى ${getStatusMessage(order.status)}`,
                  timestamp: new Date().toISOString()
                };
                
            client.send(JSON.stringify(restaurantMessage));
            sentCount++;
          } catch (error: any) {
            console.error('Error sending notification to restaurant:', error.message || error);
          }
        }
        
        // Notify delivery person if this order is assigned to them
        if (customClient.role === 'delivery' && 
            customClient.userId === order.deliveryPersonId &&
            client.readyState === WebSocket.OPEN) {
          try {
            client.send(JSON.stringify({
              type: 'delivery_update_notification',
              orderId: orderId,
              status: data.status || order.status,
              message: getDeliveryMessage(order.status),
              timestamp: new Date().toISOString()
            }));
            sentCount++;
          } catch (error: any) {
            console.error('Error sending notification to delivery person:', error.message || error);
          }
        }
      });
      
      console.log(`Broadcast order update for #${orderId} to ${sentCount} clients`);
    } catch (error) {
      console.error('Error in broadcastOrderUpdate:', error);
    }
  };
  
  // Helper function to get Arabic status messages
  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'pending': return 'في انتظار الموافقة';
      case 'accepted': return 'تمت الموافقة عليه';
      case 'preparing': return 'قيد التحضير';
      case 'ready_for_pickup': return 'جاهز للاستلام';
      case 'on_delivery': return 'قيد التوصيل';
      case 'delivered': return 'تم توصيله';
      case 'cancelled': return 'تم إلغاؤه';
      default: return 'تم تحديثه';
    }
  };
  
  // Helper function to get Arabic delivery status messages
  const getDeliveryMessage = (status: string): string => {
    switch (status) {
      case 'ready_for_pickup': return 'طلب جاهز للاستلام';
      case 'on_delivery': return 'طلب قيد التوصيل';
      case 'delivered': return 'تم تسليم الطلب بنجاح';
      default: return 'تم تحديث حالة الطلب';
    }
  };
  
  // Setup session
  app.use(
    session({
      store: new SessionStore({
        checkPeriod: 86400000 // Clear expired sessions every 24h
      }),
      secret: process.env.SESSION_SECRET || 'talabli_session_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Set to false for development, true for production with HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax', // Helps with CSRF protection
        httpOnly: true // Prevents client-side JS from reading the cookie
      }
    })
  );
  
  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'البريد الإلكتروني غير موجود' });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'كلمة المرور غير صحيحة' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ success: false, error: 'غير مصرح به' });
  };
  
  // API Routes
  
  // Auth routes
  app.post('/api/auth/register', async (req, res, next) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'البريد الإلكتروني مستخدم بالفعل'
        });
      }
      
      // Create Supabase user first
      const { data: supabaseData, error: supabaseError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          phone: userData.phone
        }
      });
      
      if (supabaseError) {
        console.error('Supabase user creation error:', supabaseError);
        return res.status(400).json({
          success: false,
          error: supabaseError.message || 'فشل في إنشاء حساب Supabase'
        });
      }
      
      // Hash password for our database
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user in our database with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: formatZodError(error)
        });
      }
      next(error);
    }
  });
  
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          success: false,
          error: info?.message || 'فشل تسجيل الدخول'
        });
      }
      req.logIn(user, (err: any) => {
        if (err) {
          return next(err);
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        
        return res.json({
          success: true,
          data: userWithoutPassword
        });
      });
    })(req, res, next);
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'حدث خطأ أثناء تسجيل الخروج'
        });
      }
      res.json({
        success: true,
        data: { message: 'تم تسجيل الخروج بنجاح' }
      });
    });
  });
  
  app.get('/api/auth/user', isAuthenticated, (req, res) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as any;
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  });
  
  // User by email route for Supabase integration
  app.get('/api/users/by-email/:email', async (req, res, next) => {
    try {
      const email = req.params.email;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'البريد الإلكتروني مطلوب'
        });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'لم يتم العثور على المستخدم'
        });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return res.json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Error fetching user by email:', error);
      next(error);
    }
  });
  
  // User address routes
  app.get('/api/addresses', isAuthenticated, async (req, res, next) => {
    try {
      const userId = Number((req.user as any).id);
      const addresses = await storage.getAddresses(userId);
      
      res.json({
        success: true,
        data: addresses
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post('/api/addresses', isAuthenticated, async (req, res, next) => {
    try {
      const userId = Number((req.user as any).id);
      const addressData = insertAddressSchema.parse({
        ...req.body,
        userId
      });
      
      const address = await storage.createAddress(addressData);
      
      res.status(201).json({
        success: true,
        data: address
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: formatZodError(error)
        });
      }
      next(error);
    }
  });
  
  app.put('/api/addresses/:id', isAuthenticated, async (req, res, next) => {
    try {
      const addressId = Number(req.params.id);
      const userId = Number((req.user as any).id);
      
      // Check if address belongs to user
      const address = await storage.getAddress(addressId);
      if (!address || address.userId !== userId) {
        return res.status(404).json({
          success: false,
          error: 'العنوان غير موجود'
        });
      }
      
      const updatedAddress = await storage.updateAddress(addressId, req.body);
      
      res.json({
        success: true,
        data: updatedAddress
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.delete('/api/addresses/:id', isAuthenticated, async (req, res, next) => {
    try {
      const addressId = Number(req.params.id);
      const userId = Number((req.user as any).id);
      
      // Check if address belongs to user
      const address = await storage.getAddress(addressId);
      if (!address || address.userId !== userId) {
        return res.status(404).json({
          success: false,
          error: 'العنوان غير موجود'
        });
      }
      
      await storage.deleteAddress(addressId);
      
      res.json({
        success: true,
        data: { message: 'تم حذف العنوان بنجاح' }
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Restaurants routes
  app.get('/api/restaurants', async (req, res, next) => {
    try {
      const search = req.query.search as string | undefined;
      const categoryId = req.query.category ? Number(req.query.category) : undefined;
      
      const restaurants = await storage.getRestaurants(search, categoryId);
      
      res.json({
        success: true,
        data: restaurants
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/restaurants/popular', async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const restaurants = await storage.getPopularRestaurants(limit);
      
      res.json({
        success: true,
        data: restaurants
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/restaurants/:id', async (req, res, next) => {
    try {
      const restaurantId = Number(req.params.id);
      
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          error: 'المطعم غير موجود'
        });
      }
      
      res.json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Menu Items routes
  app.get('/api/restaurants/:id/menu', async (req, res, next) => {
    try {
      const restaurantId = Number(req.params.id);
      const categoryId = req.query.category ? Number(req.query.category) : undefined;
      
      const menuItems = await storage.getMenuItems(restaurantId, categoryId);
      
      res.json({
        success: true,
        data: menuItems
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/menu-items/popular', async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      
      const menuItems = await storage.getPopularMenuItems(limit);
      
      res.json({
        success: true,
        data: menuItems
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Categories routes
  app.get('/api/categories', async (req, res, next) => {
    try {
      const categories = await storage.getCategories();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Orders routes
  app.get('/api/orders', isAuthenticated, async (req, res, next) => {
    try {
      const userId = Number((req.user as any).id);
      
      const orders = await storage.getOrders(userId);
      
      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/orders/:id', isAuthenticated, async (req, res, next) => {
    try {
      const orderId = Number(req.params.id);
      const userId = Number((req.user as any).id);
      
      const order = await storage.getOrder(orderId);
      if (!order || order.userId !== userId) {
        return res.status(404).json({
          success: false,
          error: 'الطلب غير موجود'
        });
      }
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post('/api/orders', isAuthenticated, async (req, res, next) => {
    try {
      const userId = Number((req.user as any).id);
      
      // Validate order data
      const orderData = insertOrderSchema.parse({
        ...req.body.order,
        userId
      });
      
      // Validate order items
      if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'يجب تقديم عناصر الطلب'
        });
      }
      
      const orderItems = req.body.items.map((item: any) => 
        insertOrderItemSchema.parse(item)
      );
      
      // Create order
      const order = await storage.createOrder(orderData, orderItems);
      
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: formatZodError(error)
        });
      }
      next(error);
    }
  });
  
  // This would be an admin/restaurant endpoint in a real app
  // But for demo purposes, we'll make it public to simulate order updates
  app.put('/api/orders/:id/status', async (req, res, next) => {
    try {
      const orderId = Number(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'حالة الطلب مطلوبة'
        });
      }
      
      const order = await storage.updateOrderStatus(orderId, status);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'الطلب غير موجود'
        });
      }
      
      // Broadcast order update to subscribed clients
      broadcastOrderUpdate(orderId, {
        type: 'statusUpdate',
        data: { orderId, status, updatedAt: order.updatedAt }
      });
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  });
  
  // This would be a driver app endpoint in a real app
  // But for demo purposes, we'll make it public to simulate driver location updates
  app.put('/api/orders/:id/driver-location', async (req, res, next) => {
    try {
      const orderId = Number(req.params.id);
      const { lat, lng } = req.body;
      
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'إحداثيات السائق مطلوبة'
        });
      }
      
      const order = await storage.updateDriverLocation(orderId, lat, lng);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'الطلب غير موجود'
        });
      }
      
      // Broadcast driver location update to subscribed clients
      broadcastOrderUpdate(orderId, {
        type: 'driverLocationUpdate',
        data: { orderId, lat, lng, updatedAt: order.updatedAt }
      });
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Promotions routes
  app.get('/api/promotions/:code/validate', async (req, res, next) => {
    try {
      const { code } = req.params;
      const total = req.query.total ? parseFloat(req.query.total as string) : 0;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'رمز الترويج مطلوب'
        });
      }
      
      const promotion = await storage.validatePromotion(code, total);
      if (!promotion) {
        return res.status(404).json({
          success: false,
          error: 'رمز الترويج غير صالح'
        });
      }
      
      res.json({
        success: true,
        data: promotion
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Admin routes
  app.use('/api/admin', adminRouter);
  
  return httpServer;
}
