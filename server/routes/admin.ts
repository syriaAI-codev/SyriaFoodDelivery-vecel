import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { formatZodError } from '../middleware/error-handler';

const router = Router();

// Middleware to check if user is admin
const isAdmin = async (req: Request, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, error: 'غير مصرح به' });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'غير مسموح به' });
  }
  
  next();
};

// Apply admin check middleware to all routes
router.use(isAdmin);

// Dashboard overview
router.get('/overview', async (req: Request, res: Response) => {
  try {
    // Get counts and stats from storage
    const totalOrders = await storage.getOrdersCount();
    const revenueToday = await storage.getRevenueBetweenDates(
      new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
      new Date() // Now
    );
    const revenueWeek = await storage.getRevenueBetweenDates(
      new Date(new Date().setDate(new Date().getDate() - 7)), // 7 days ago
      new Date() // Now
    );
    const activeRestaurants = await storage.getActiveRestaurantsCount();
    const availableDelivery = await storage.getAvailableDeliveryCount();
    
    // Get orders by status for pie chart
    const ordersByStatus = await storage.getOrderCountsByStatus();

    return res.json({
      success: true,
      data: {
        totalOrders,
        revenueToday,
        revenueWeek,
        activeRestaurants,
        availableDelivery,
        ordersByStatus
      }
    });
  } catch (error) {
    console.error('Error fetching overview data:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب بيانات لوحة التحكم'
    });
  }
});

// Users management
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const users = await storage.getUsers(search as string | undefined);
    return res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب بيانات المستخدمين'
    });
  }
});

const updateUserSchema = z.object({
  role: z.enum(['customer', 'restaurant', 'delivery', 'admin']).optional(),
  isActive: z.boolean().optional(),
});

router.patch('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Validate input
    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: formatZodError(result.error) 
      });
    }
    
    // Update user
    const updatedUser = await storage.updateUserRole(userId, result.data);
    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'المستخدم غير موجود' });
    }
    
    return res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء تحديث بيانات المستخدم'
    });
  }
});

// Restaurants management
router.get('/restaurants', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const restaurants = await storage.getRestaurantsWithOwners(search as string | undefined);
    return res.json({ success: true, data: restaurants });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب بيانات المطاعم'
    });
  }
});

// Orders management
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const orders = await storage.getOrdersWithDetails(search as string | undefined);
    return res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب بيانات الطلبات'
    });
  }
});

const updateOrderSchema = z.object({
  status: z.enum([
    'pending', 'accepted', 'preparing', 
    'ready_for_pickup', 'on_delivery', 'delivered', 'cancelled'
  ]),
});

router.patch('/orders/:id', async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    
    // Validate input
    const result = updateOrderSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: formatZodError(result.error) 
      });
    }
    
    // Update order status
    const updatedOrder = await storage.updateOrderStatus(orderId, result.data.status);
    if (!updatedOrder) {
      return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
    }
    
    return res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء تحديث حالة الطلب'
    });
  }
});

const assignDeliverySchema = z.object({
  deliveryPersonId: z.number(),
});

router.post('/orders/:id/assign', async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    
    // Validate input
    const result = assignDeliverySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: formatZodError(result.error) 
      });
    }
    
    // Assign delivery person to order
    const delivery = await storage.assignDeliveryPerson(
      orderId, 
      result.data.deliveryPersonId
    );
    
    if (!delivery) {
      return res.status(404).json({ 
        success: false, 
        error: 'الطلب غير موجود أو عامل التوصيل غير متاح' 
      });
    }
    
    return res.json({ success: true, data: delivery });
  } catch (error) {
    console.error('Error assigning delivery person:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء تعيين عامل التوصيل'
    });
  }
});

// Analytics endpoints
router.get('/analytics/orders-by-day', async (req: Request, res: Response) => {
  try {
    // Get orders per day for the last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const dailyOrders = await storage.getOrdersCountByDay(startDate, endDate);
    
    return res.json({ 
      success: true, 
      data: dailyOrders
    });
  } catch (error) {
    console.error('Error fetching daily orders:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب بيانات الطلبات اليومية'
    });
  }
});

router.get('/analytics/revenue-by-day', async (req: Request, res: Response) => {
  try {
    // Get revenue per day for the last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const dailyRevenue = await storage.getRevenueByDay(startDate, endDate);
    
    return res.json({ 
      success: true, 
      data: dailyRevenue
    });
  } catch (error) {
    console.error('Error fetching daily revenue:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب بيانات الإيرادات اليومية'
    });
  }
});

// Delivery persons management
router.get('/delivery-persons', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const deliveryPersons = await storage.getDeliveryPersonsWithDetails(search as string | undefined);
    return res.json({ success: true, data: deliveryPersons });
  } catch (error) {
    console.error('Error fetching delivery persons:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب بيانات عمال التوصيل'
    });
  }
});

export default router;