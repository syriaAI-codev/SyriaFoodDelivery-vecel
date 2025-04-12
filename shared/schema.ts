import { pgTable, text, uuid, serial, integer, boolean, timestamp, numeric, pgEnum, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Custom enums
export const orderStatusEnum = pgEnum('order_status', ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'on_delivery', 'delivered', 'cancelled']);
export const userRoleEnum = pgEnum('user_role', ['customer', 'restaurant', 'delivery', 'admin']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['assigned', 'picked_up', 'delivered', 'failed_delivery']);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  address: text("address"),
  username: text("username"),
  role: userRoleEnum("role").default('customer').notNull(),
  restaurantId: integer("restaurant_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  orders: many(orders),
  addresses: many(addresses),
}));

// User addresses
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  address: text("address").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  isDefault: boolean("is_default").default(false),
});

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

// Restaurants
export const restaurants = pgTable("restaurants", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  logo: text("logo"),
  coverImage: text("cover_image"),
  cuisineType: text("cuisine_type").array(),
  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
  minOrderAmount: doublePrecision("min_order_amount").default(0),
  deliveryFee: doublePrecision("delivery_fee").default(0),
  deliveryTime: text("delivery_time"),
  isOpen: boolean("is_open").default(true),
  hasPromo: boolean("has_promo").default(false),
  discount: integer("discount").default(0),
});

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  menuItems: many(menuItems),
  orders: many(orders),
}));

// Categories
export const categories = pgTable("categories", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").notNull(),
  icon: text("icon"),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  menuItems: many(menuItems),
}));

// Menu Items
export const menuItems = pgTable("menu_items", {
  id: integer("id").primaryKey().notNull(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  categoryId: integer("category_id").references(() => categories.id),
  name: text("name").notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  image: text("image"),
  isAvailable: boolean("is_available").default(true),
  isPopular: boolean("is_popular").default(false),
  hasDiscount: boolean("has_discount").default(false),
  discountPercentage: integer("discount_percentage").default(0),
});

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id],
  }),
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  restaurantId: integer("restaurant_id").references(() => restaurants.id, { onDelete: 'set null' }),
  addressId: integer("address_id"),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryLat: doublePrecision("delivery_lat").notNull(),
  deliveryLng: doublePrecision("delivery_lng").notNull(),
  driverLat: doublePrecision("driver_lat"),
  driverLng: doublePrecision("driver_lng"),
  status: text("status").default('pending'),
  total: doublePrecision("total").notNull(),
  subtotal: doublePrecision("subtotal").notNull(),
  deliveryFee: doublePrecision("delivery_fee").default(0),
  discount: doublePrecision("discount").default(0),
  notes: text("notes"),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  items: many(orderItems),
}));

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey().notNull(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: integer("menu_item_id").references(() => menuItems.id, { onDelete: 'set null' }),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  totalPrice: doublePrecision("total_price").notNull(),
  notes: text("notes"),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

// Delivery Persons
export const deliveryPersons = pgTable("delivery_persons", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  isAvailable: boolean("is_available").default(false),
  currentLat: doublePrecision("current_lat"),
  currentLng: doublePrecision("current_lng"),
  lastLocationUpdate: timestamp("last_location_update"),
});

export const deliveryPersonsRelations = relations(deliveryPersons, ({ one, many }) => ({
  user: one(users, {
    fields: [deliveryPersons.userId],
    references: [users.id],
  }),
  deliveries: many(deliveries),
}));

// Deliveries
export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey().notNull(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
  deliveryPersonId: integer("delivery_person_id").notNull().references(() => deliveryPersons.id, { onDelete: 'cascade' }),
  status: deliveryStatusEnum("status").default('assigned').notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  pickedUpAt: timestamp("picked_up_at"),
  deliveredAt: timestamp("delivered_at"),
  notes: text("notes"),
});

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  order: one(orders, {
    fields: [deliveries.orderId],
    references: [orders.id],
  }),
  deliveryPerson: one(deliveryPersons, {
    fields: [deliveries.deliveryPersonId],
    references: [deliveryPersons.id],
  }),
}));

// Promotions
export const promotions = pgTable("promotions", {
  id: integer("id").primaryKey().notNull(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(), // percentage, fixed
  discountValue: doublePrecision("discount_value").notNull(),
  minOrderValue: doublePrecision("min_order_value").default(0),
  maxDiscount: doublePrecision("max_discount"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  bgColor: text("bg_color"),
});

// Insert and Select schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const selectUserSchema = createSelectSchema(users);

export const insertAddressSchema = createInsertSchema(addresses).omit({ id: true });
export const selectAddressSchema = createSelectSchema(addresses);

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({ id: true });
export const selectRestaurantSchema = createSelectSchema(restaurants);

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const selectCategorySchema = createSelectSchema(categories);

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const selectMenuItemSchema = createSelectSchema(menuItems);

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const selectOrderSchema = createSelectSchema(orders);

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const selectOrderItemSchema = createSelectSchema(orderItems);

export const insertPromotionSchema = createInsertSchema(promotions).omit({ id: true });
export const selectPromotionSchema = createSelectSchema(promotions);

export const insertDeliveryPersonSchema = createInsertSchema(deliveryPersons).omit({ id: true });
export const selectDeliveryPersonSchema = createSelectSchema(deliveryPersons);

export const insertDeliverySchema = createInsertSchema(deliveries).omit({ id: true });
export const selectDeliverySchema = createSelectSchema(deliveries);

// Types export
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;

export type DeliveryPerson = typeof deliveryPersons.$inferSelect;
export type InsertDeliveryPerson = z.infer<typeof insertDeliveryPersonSchema>;

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
