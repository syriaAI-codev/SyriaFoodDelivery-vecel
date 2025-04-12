import { db } from './db';
import { eq, and, desc, like, or, gt, lt, gte, lte, isNull, isNotNull, count, inArray, notInArray, sql } from 'drizzle-orm';
import {
  users, restaurants, categories, menuItems, orders, orderItems, promotions, addresses,
  deliveryPersons, deliveries,
  User, InsertUser, Restaurant, InsertRestaurant, Category, InsertCategory,
  MenuItem, InsertMenuItem, Order, InsertOrder, OrderItem, InsertOrderItem,
  Promotion, InsertPromotion, Address, InsertAddress, DeliveryPerson, Delivery
} from '@shared/schema';

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsers(search?: string): Promise<User[]>;
  updateUserRole(id: number, data: { role?: string, isActive?: boolean }): Promise<User | undefined>;
  
  // Addresses
  getAddresses(userId: number): Promise<Address[]>;
  getAddress(id: number): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: number): Promise<boolean>;
  
  // Restaurants
  getRestaurants(search?: string, categoryId?: number): Promise<Restaurant[]>;
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getPopularRestaurants(limit?: number): Promise<Restaurant[]>;
  getRestaurantsWithOwners(search?: string): Promise<Restaurant[]>;
  getActiveRestaurantsCount(): Promise<number>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  
  // MenuItems
  getMenuItems(restaurantId: number, categoryId?: number): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  getPopularMenuItems(limit?: number): Promise<MenuItem[]>;
  
  // Orders
  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  updateDriverLocation(id: number, lat: number, lng: number): Promise<Order | undefined>;
  getOrdersWithDetails(search?: string): Promise<Order[]>;
  getOrdersCount(): Promise<number>;
  getRevenueBetweenDates(startDate: Date, endDate: Date): Promise<number>;
  getOrderCountsByStatus(): Promise<{ status: string; count: number }[]>;
  getOrdersCountByDay(startDate: Date, endDate: Date): Promise<{ date: string; count: number }[]>;
  getRevenueByDay(startDate: Date, endDate: Date): Promise<{ date: string; total: number }[]>;
  
  // Promotions
  getPromotion(code: string): Promise<Promotion | undefined>;
  validatePromotion(code: string, total: number): Promise<Promotion | undefined>;
  
  // Delivery Persons
  getDeliveryPersonsWithDetails(search?: string): Promise<DeliveryPerson[]>;
  getAvailableDeliveryCount(): Promise<number>;
  assignDeliveryPerson(orderId: number, deliveryPersonId: number): Promise<Delivery | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values({
      email: user.email,
      name: user.name,
      password: user.password,
      phone: user.phone,
      address: user.address,
      username: user.username
    }).returning();
    return createdUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getUsers(search?: string): Promise<User[]> {
    let query = db.select().from(users);
    
    if (search) {
      query = query.where(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.phone, `%${search}%`)
        )
      );
    }
    
    return query.orderBy(users.name);
  }

  async updateUserRole(id: number, data: { role?: string, isActive?: boolean }): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Addresses
  async getAddresses(userId: number): Promise<Address[]> {
    return db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async getAddress(id: number): Promise<Address | undefined> {
    const [address] = await db.select().from(addresses).where(eq(addresses.id, id));
    return address;
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    if (address.isDefault) {
      // Set all other addresses to non-default for this user
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, address.userId));
    }
    
    const [createdAddress] = await db.insert(addresses).values({
      address: address.address,
      userId: address.userId,
      title: address.title,
      lat: address.lat,
      lng: address.lng,
      isDefault: address.isDefault
    }).returning();
    return createdAddress;
  }

  async updateAddress(id: number, addressData: Partial<InsertAddress>): Promise<Address | undefined> {
    if (addressData.isDefault) {
      const [address] = await db.select().from(addresses).where(eq(addresses.id, id));
      if (address) {
        // Set all other addresses to non-default for this user
        await db
          .update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, address.userId));
      }
    }
    
    const [updatedAddress] = await db
      .update(addresses)
      .set(addressData)
      .where(eq(addresses.id, id))
      .returning();
    return updatedAddress;
  }

  async deleteAddress(id: number): Promise<boolean> {
    const [deletedAddress] = await db.delete(addresses).where(eq(addresses.id, id)).returning();
    return !!deletedAddress;
  }

  // Restaurants
  async getRestaurants(search?: string, categoryId?: number): Promise<Restaurant[]> {
    let query = db.select().from(restaurants);
    
    if (search) {
      query = query.where(like(restaurants.name, `%${search}%`));
    }
    
    if (categoryId) {
      const restaurantIds = await db
        .select({ id: menuItems.restaurantId })
        .from(menuItems)
        .where(eq(menuItems.categoryId, categoryId))
        .groupBy(menuItems.restaurantId);
      
      if (restaurantIds.length > 0) {
        const ids = restaurantIds.map(r => r.id);
        // Use or with multiple eq conditions instead of .in
        query = db.select().from(restaurants).where(
          or(...ids.map(id => eq(restaurants.id, id)))
        );
      }
    }
    
    return query.orderBy(restaurants.name);
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }

  async getPopularRestaurants(limit: number = 10): Promise<Restaurant[]> {
    return db
      .select()
      .from(restaurants)
      .orderBy(desc(restaurants.rating))
      .limit(limit);
  }

  async getRestaurantsWithOwners(search?: string): Promise<Restaurant[]> {
    const result = await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        description: restaurants.description,
        phone: restaurants.phone,
        locationAddress: restaurants.locationAddress,
        ownerId: restaurants.ownerId,
        ownerName: users.name
      })
      .from(restaurants)
      .leftJoin(users, eq(restaurants.ownerId, users.id))
      .where(search ? like(restaurants.name, `%${search}%`) : undefined as any)
      .orderBy(restaurants.name);
      
    return result;
  }
  
  async getActiveRestaurantsCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(restaurants);
      
    return result?.count || 0;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  // MenuItems
  async getMenuItems(restaurantId: number, categoryId?: number): Promise<MenuItem[]> {
    let query = db
      .select()
      .from(menuItems)
      .where(eq(menuItems.restaurantId, restaurantId));
    
    if (categoryId) {
      query = db.select()
        .from(menuItems)
        .where(and(
          eq(menuItems.restaurantId, restaurantId),
          eq(menuItems.categoryId, categoryId)
        ));
    }
    
    return query;
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return menuItem;
  }

  async getPopularMenuItems(limit: number = 8): Promise<MenuItem[]> {
    return db
      .select()
      .from(menuItems)
      .where(eq(menuItems.isPopular, true))
      .limit(limit);
  }

  // Orders
  async getOrders(userId: number): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Start transaction
    return db.transaction(async (tx) => {
      const [createdOrder] = await tx.insert(orders).values({
        deliveryAddress: order.deliveryAddress,
        deliveryLat: order.deliveryLat,
        deliveryLng: order.deliveryLng,
        total: order.total,
        subtotal: order.subtotal,
        paymentMethod: order.paymentMethod,
        status: order.status,
        userId: order.userId,
        restaurantId: order.restaurantId,
        restaurantName: order.restaurantName,
        deliveryFee: order.deliveryFee,
        promoCode: order.promoCode,
        promoDiscount: order.promoDiscount,
        driverLat: order.driverLat,
        driverLng: order.driverLng,
        notes: order.notes
      }).returning();
      
      // Add order ID to each item
      for (const item of items) {
        await tx.insert(orderItems).values({
          orderId: createdOrder.id,
          menuItemId: item.menuItemId,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          notes: item.notes
        });
      }
      
      return createdOrder;
    });
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async updateDriverLocation(id: number, lat: number, lng: number): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ driverLat: lat, driverLng: lng, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }
  
  async getOrdersWithDetails(search?: string): Promise<Order[]> {
    const query = db
      .select({
        id: orders.id,
        status: orders.status,
        totalPrice: orders.total,
        createdAt: orders.createdAt,
        customerName: users.name,
        deliveryAddress: orders.deliveryAddress,
        restaurantName: orders.restaurantName
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(restaurants, eq(orders.restaurantId, restaurants.id));
      
    if (search) {
      return query.where(
        or(
          like(orders.id.toString(), `%${search}%`),
          like(users.name, `%${search}%`),
          like(orders.restaurantName, `%${search}%`)
        )
      ).orderBy(desc(orders.createdAt));
    }
    
    return query.orderBy(desc(orders.createdAt));
  }
  
  async getOrdersCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(orders);
      
    return result?.count || 0;
  }
  
  async getRevenueBetweenDates(startDate: Date, endDate: Date): Promise<number> {
    const deliveredOrders = await db
      .select({ total: orders.total })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'delivered'),
          gte(orders.createdAt, startDate),
          lte(orders.createdAt, endDate)
        )
      );
      
    return deliveredOrders.reduce((sum, order) => sum + Number(order.total), 0);
  }

  async getOrderCountsByStatus(): Promise<{ status: string; count: number }[]> {
    const result = await db
      .select({
        status: orders.status,
        count: count()
      })
      .from(orders)
      .groupBy(orders.status);
    
    return result;
  }

  async getOrdersCountByDay(startDate: Date, endDate: Date): Promise<{ date: string; count: number }[]> {
    // Format date as YYYY-MM-DD for grouping
    const result = await db
      .select({
        date: sql`DATE(${orders.createdAt})`,
        count: count()
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDate),
          lte(orders.createdAt, endDate)
        )
      )
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`);
    
    return result.map(row => ({
      date: row.date.toString(),
      count: row.count
    }));
  }

  async getRevenueByDay(startDate: Date, endDate: Date): Promise<{ date: string; total: number }[]> {
    // Format date as YYYY-MM-DD for grouping
    const result = await db
      .select({
        date: sql`DATE(${orders.createdAt})`,
        total: sql`SUM(${orders.total})`
      })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'delivered'),
          gte(orders.createdAt, startDate),
          lte(orders.createdAt, endDate)
        )
      )
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`);
    
    return result.map(row => ({
      date: row.date.toString(),
      total: Number(row.total)
    }));
  }

  // Promotions
  async getPromotion(code: string): Promise<Promotion | undefined> {
    const [promotion] = await db
      .select()
      .from(promotions)
      .where(eq(promotions.code, code));
    return promotion;
  }

  async validatePromotion(code: string, total: number): Promise<Promotion | undefined> {
    const now = new Date();
    
    const [promotion] = await db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.code, code),
          eq(promotions.isActive, true),
          lte(promotions.startDate, now),
          gte(promotions.endDate, now),
          lte(promotions.minOrderValue, total)
        )
      );
    
    return promotion;
  }
  
  // Delivery Persons
  async getDeliveryPersonsWithDetails(search?: string): Promise<DeliveryPerson[]> {
    const deliveryUsersQuery = db
      .select({
        userId: deliveryPersons.userId,
        name: users.name,
        phone: users.phone,
        isAvailable: deliveryPersons.isAvailable
      })
      .from(deliveryPersons)
      .leftJoin(users, eq(deliveryPersons.userId, users.id));
      
    if (search) {
      const result = await deliveryUsersQuery.where(
        or(
          like(users.name, `%${search}%`),
          like(users.phone, `%${search}%`)
        )
      );
      
      // Add current active orders for each delivery person
      for (const delivery of result) {
        const activeOrders = await db
          .select({ count: count() })
          .from(deliveries)
          .where(
            and(
              eq(deliveries.deliveryPersonId, delivery.userId),
              notInArray(deliveries.status, ['delivered', 'failed_delivery'])
            )
          );
          
        delivery.currentOrders = activeOrders[0]?.count || 0;
      }
      
      return result;
    }
    
    const result = await deliveryUsersQuery;
    
    // Add current active orders for each delivery person
    for (const delivery of result) {
      const activeOrders = await db
        .select({ count: count() })
        .from(deliveries)
        .where(
          and(
            eq(deliveries.deliveryPersonId, delivery.userId),
            notInArray(deliveries.status, ['delivered', 'failed_delivery'])
          )
        );
        
      delivery.currentOrders = activeOrders[0]?.count || 0;
    }
    
    return result;
  }
  
  async getAvailableDeliveryCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(deliveryPersons)
      .where(eq(deliveryPersons.isAvailable, true));
      
    return result?.count || 0;
  }
  
  async assignDeliveryPerson(orderId: number, deliveryPersonId: number): Promise<Delivery | undefined> {
    // Check if delivery person is available
    const [deliveryPerson] = await db
      .select()
      .from(deliveryPersons)
      .where(
        and(
          eq(deliveryPersons.userId, deliveryPersonId),
          eq(deliveryPersons.isAvailable, true)
        )
      );
      
    if (!deliveryPerson) {
      return undefined;
    }
    
    // Check if order exists and status is appropriate for delivery
    const [order] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, orderId),
          inArray(orders.status, ['accepted', 'preparing', 'ready_for_pickup'])
        )
      );
      
    if (!order) {
      return undefined;
    }
    
    // Create delivery record
    return db.transaction(async (tx) => {
      // Check if delivery already exists for this order
      const existingDelivery = await tx
        .select()
        .from(deliveries)
        .where(eq(deliveries.orderId, orderId));
        
      if (existingDelivery.length > 0) {
        // Update existing delivery
        const [updated] = await tx
          .update(deliveries)
          .set({
            deliveryPersonId,
            status: 'assigned',
            pickedUpAt: null,
            deliveredAt: null
          })
          .where(eq(deliveries.orderId, orderId))
          .returning();
          
        // Update order status if needed
        if (order.status !== 'on_delivery') {
          await tx
            .update(orders)
            .set({ 
              status: 'on_delivery',
              updatedAt: new Date()
            })
            .where(eq(orders.id, orderId));
        }
        
        return updated;
      } else {
        // Create new delivery
        const [delivery] = await tx
          .insert(deliveries)
          .values({
            orderId,
            deliveryPersonId,
            status: 'assigned'
          })
          .returning();
        
        // Update order status
        await tx
          .update(orders)
          .set({ 
            status: 'on_delivery',
            updatedAt: new Date()
          })
          .where(eq(orders.id, orderId));
          
        return delivery;
      }
    });
  }
}

export const storage = new DatabaseStorage();
