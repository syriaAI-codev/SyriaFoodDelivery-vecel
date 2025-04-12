# Comprehensive Project Context: Syria Food Delivery App

**Last Updated:** [أدخل تاريخ اليوم هنا]

## 1. Introduction & Goal

*   **Project Name:** Syria Food Delivery App (SyriaFoodApp / SyrianBites)
*   **Core Objective:** Develop a fully functional, production-ready (MVP initially) food delivery web application specifically tailored for the Syrian market, with a complete Right-to-Left (RTL) Arabic user interface.
*   **Target Platform:** Web application, developed and intended to be hosted on Replit.
*   **Target Users:** Customers ordering food, Restaurant Owners managing menus/orders, Delivery Personnel fulfilling orders, and Administrators overseeing the platform.
*   **Key Goal for Next Phase:** Complete the development to achieve a functional Minimum Viable Product (MVP) focusing on core features: user authentication, restaurant/menu browsing, order placement (Cash on Delivery primarily), order management for restaurants, and basic delivery tracking.

## 2. Current Status Summary

The project foundation has been established within the Replit environment. This includes:
*   A clear project structure separating frontend (React/Vite) and backend (Node/Express).
*   Selection and basic setup of the core technology stack (React, Node, Supabase, Drizzle, Tailwind CSS).
*   Implementation of basic user authentication flow integrated with Supabase Auth.
*   Definition of the database schema using Drizzle ORM.
*   Basic setup for real-time communication using WebSockets.
*   Establishment of basic routing and some UI components.

However, several critical features required for a functional MVP are **missing or incomplete**, as detailed in the "Prioritized Remaining Tasks" section below.

## 3. Development Environment (Replit)

*   **Platform:** Replit (`https://replit.com/@sehapostmartall/SyriaFoodApp?v=1`)
*   **Secrets Management:** All sensitive credentials (Database connection strings, API Keys like Supabase and Google Maps, JWT/Session secrets) **MUST** be stored and accessed securely using **Replit Secrets**. **Do NOT hardcode secrets in the codebase.**
*   **Running the Application:** The project uses `npm run dev` (likely configured via `package.json` scripts or Replit's `run` button/workflow) to start both the frontend Vite development server and the backend Node.js server concurrently.
    *   Frontend is accessible via the Replit Webview.
    *   Backend server typically runs on port 5000 or 3001 (check `server/index.ts`).
    *   WebSocket endpoint is available at `/ws`.
*   **Database:** PostgreSQL hosted on Supabase. Connection details are managed via Replit Secrets (e.g., `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`).

## 4. Technology Stack

*   **Frontend:**
    *   **React.js:** UI library.
    *   **Vite:** Build tool and development server.
    *   **Tailwind CSS:** Utility-first CSS framework (configured for RTL).
    *   **shadcn/ui:** UI component library (built on Radix UI and Tailwind).
    *   **Framer Motion:** Animation library.
    *   **TanStack Query (React Query):** Data fetching and state management.
    *   **Wouter:** Lightweight routing library (Verify if `react-router-dom` is also used/preferred based on `App.tsx`).
    *   **React Hook Form & Zod:** Form validation.
    *   **@supabase/supabase-js:** Supabase client library.
    *   **axios:** HTTP client (optional, `fetch` can also be used).
    *   **Google Maps API:** For maps integration.
*   **Backend:**
    *   **Node.js:** JavaScript runtime.
    *   **Express.js:** Web framework.
    *   **TypeScript:** Static typing.
    *   **Drizzle ORM:** Database ORM for PostgreSQL.
    *   **`ws` library:** WebSocket implementation.
    *   **`express-session`:** Session management.
*   **Database:**
    *   **PostgreSQL (hosted on Supabase)**
*   **Authentication:**
    *   **Supabase Auth** (primary) integrated with backend session management.
*   **Shared:**
    *   TypeScript types and Drizzle schema definitions in the `shared/` directory.

## 5. Project Structure (File Tree)

```
├── client/
│   ├── index.html
│   └── src/
│       ├── assets/
│       │   └── icons/
│       │       └── index.tsx
│       ├── components/
│       │   ├── admin/
│       │   │   ├── AdminLayout.tsx
│       │   │   └── AdminSidebar.tsx
│       │   ├── cart/
│       │   │   └── CartSidebar.tsx
│       │   ├── common/
│       │   │   └── ProtectedRoute.tsx
│       │   ├── home/
│       │   │   ├── AppDownload.tsx
│       │   │   ├── FoodCategories.tsx
│       │   │   ├── HeroSection.tsx
│       │   │   ├── HowItWorks.tsx
│       │   │   ├── PopularRestaurants.tsx
│       │   │   ├── PromoSection.tsx
│       │   │   └── SpecialDishes.tsx
│       │   ├── layout/
│       │   │   ├── Footer.tsx
│       │   │   ├── Header.tsx
│       │   │   └── MobileNavigation.tsx
│       │   ├── restaurant/
│       │   │   ├── MenuSection.tsx
│       │   │   ├── OrdersSection.tsx
│       │   │   └── ProfileSection.tsx
│       │   ├── ui/
│       │   │   ├── accordion.tsx
│       │   │   ├── alert-dialog.tsx
│       │   │   ├── alert.tsx
│       │   │   ├── aspect-ratio.tsx
│       │   │   ├── avatar.tsx
│       │   │   ├── badge.tsx
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── form.tsx
│       │   │   ├── input.tsx
│       │   │   ├── select.tsx
│       │   │   └── ... (many other UI components from shadcn/ui)
│       │   └── GoogleMap.tsx
│       ├── context/
│       │   ├── AuthContext.tsx
│       │   ├── CartContext.tsx
│       │   └── WebSocketContext.tsx
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useCart.tsx
│       │   ├── use-mobile.tsx
│       │   ├── useOrderTracking.ts
│       │   └── use-toast.ts
│       ├── lib/
│       │   ├── queryClient.ts
│       │   ├── supabase.ts
│       │   └── utils.ts
│       ├── pages/
│       │   ├── admin/
│       │   │   └── DashboardPage.tsx
│       │   ├── delivery/
│       │   │   └── DashboardPage.tsx
│       │   ├── restaurant/
│       │   │   └── DashboardPage.tsx
│       │   ├── CategoriesPage.tsx
│       │   ├── CheckoutPage.tsx
│       │   ├── HomePage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── not-found.tsx
│       │   ├── PopularDishesPage.tsx
│       │   ├── PopularRestaurantsPage.tsx
│       │   ├── ProfilePage.tsx
│       │   ├── RestaurantDetailsPage.tsx
│       │   ├── RestaurantsPage.tsx
│       │   ├── SignupPage.tsx
│       │   ├── TrackOrderPage.tsx
│       │   └── UnauthorizedPage.tsx
│       ├── App.tsx
│       ├── index.css
│       └── main.tsx
├── server/
│   ├── middleware/
│   │   └── error-handler.ts
│   ├── routes/
│   │   └── admin.ts // Other route files like auth.ts, restaurants.ts etc. should be here
│   ├── db.ts
│   ├── index.ts
│   ├── routes.ts  // Main route registration file
│   ├── storage.ts // Database access layer abstraction
│   ├── supabase.ts // Supabase admin client interaction
│   └── vite.ts     // Possibly related to Vite integration? Verify purpose.
├── shared/
│   ├── schema.ts  // Drizzle ORM schema definitions
│   └── types.ts   // Shared TypeScript types
├── drizzle.config.ts
├── migrate.ts // Drizzle migration script
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── theme.json // Possibly related to shadcn/ui theming
├── tsconfig.json
└── vite.config.ts
```

## 6. Core Logic & Key File Summaries

*(Based on previous AI Agent analysis - Add/Modify as needed)*

*   **`server/index.ts`:** Entry point for the Express backend. Sets up server, middleware (JSON, Sessions via `express-session` using `SESSION_SECRET` from Secrets), registers routes via `server/routes.ts`, includes global error handling, and starts the server (port 5000).
*   **`server/routes.ts`:** Registers all HTTP API routes (e.g., `/api/auth`, `/api/restaurants`, etc.) using Express routers defined in `server/routes/`. Also initializes the WebSocket server (`ws`) on the `/ws` path, handles WebSocket connections, and potentially WebSocket authentication linked to the Express session. Includes `isAuthenticated` middleware for protecting routes.
*   **`client/src/App.tsx`:** Main React component defining application structure and routing using `Wouter` (or `react-router-dom` - verify). Wraps the application in context providers (`AuthProvider`, `CartProvider`, `WebSocketProvider`, `QueryClientProvider`). Defines public and protected routes using `ProtectedRoute` component based on user roles.
*   **`client/src/context/AuthContext.tsx`:** Manages global authentication state. Integrates with `supabase.auth` for login/signup/logout and session state changes. Fetches detailed user profile information (including role) from the backend API (`/api/auth/me`) after successful Supabase authentication. Provides user object, auth status, and role-checking helper functions (`isAdmin`, `isCustomer`, etc.) to the rest of the app.
*   **`shared/schema.ts`:** Defines the entire PostgreSQL database schema using Drizzle ORM (`pgTable`). Includes definitions for tables like `users`, `restaurants`, `menuItems`, `orders`, `categories`, `addresses`, etc., specifying columns, types, constraints (NOT NULL, UNIQUE, CHECK), default values, and importantly, relationships between tables using Drizzle `relations`. May also include Zod schemas derived from Drizzle schemas for validation (`createInsertSchema`, `createSelectSchema`).

## 7. Database Schema & ORM (Drizzle)

*   **Database:** PostgreSQL hosted on Supabase.
*   **ORM:** Drizzle ORM is used for schema definition, migrations (likely via `migrate.ts` and `drizzle-kit`), type-safe querying, and defining relationships.
*   **Schema Definition (`shared/schema.ts`):** Contains all `pgTable` definitions for the application's data model. Relationships (one-to-many, many-to-many) are defined using Drizzle's `relations` helper function, enabling type-safe joins and data fetching.
*   **Database Access (`server/storage.ts` & `server/db.ts`):** The `server/db.ts` file likely initializes the Drizzle client connection using credentials from Replit Secrets. The `server/storage.ts` file likely abstracts database operations, providing a cleaner interface for route handlers to interact with the database via Drizzle queries (e.g., `db.select().from(...)`, `db.insert()...`).

**(Optional but Recommended: Paste the full content of `shared/schema.ts` here if it's reasonably concise, or provide a direct link to the file in the Replit project)**
```typescript
// Paste the content of shared/schema.ts here
// Example:
import { pgTable, serial, text, integer, doublePrecision, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
// ... rest of your schema definitions ...
```

## 8. Prioritized Remaining Tasks for MVP

*(Based on previous AI Agent analysis)*

1.  **Data Seeding and Sample Content (#6):** Create and run a script (`server/seed.js`) using Drizzle to populate the database with initial categories, users (owners/admin), restaurants, and menu items. *Crucial for testing and demonstrating functionality.*
2.  **Order Management for Restaurant Owners (#3):** Implement the core UI and backend logic for restaurant owners to view incoming orders, accept/reject them, and update order status (e.g., 'preparing', 'ready_for_pickup'). *Core business flow.*
3.  **Delivery Person Interface (#4):** Build the basic UI and backend logic for delivery personnel to view assigned orders and update delivery status (e.g., 'picked_up', 'delivered'). *Completes the delivery cycle.*
4.  **WebSocket Implementation for Real-time Order Tracking (#1):** Complete the WebSocket integration on both backend (message handling, broadcasting) and frontend (subscribing to updates in relevant components like order tracking, restaurant dashboard) for core status changes. *Key UX feature.*
5.  **Google Maps Integration for Route Visualization (#5):** Implement basic route visualization on the order tracking map using Google Maps Directions Service to show the path between restaurant and customer. *Enhances tracking UX.*
6.  **Form Validation with Arabic Error Messages (#9):** Ensure key forms (signup, checkout, profile edit) have robust validation using Zod/React Hook Form, providing clear and culturally appropriate error messages in Arabic. *Essential for usability.*
7.  **Mobile Responsiveness for RTL Layout (#12):** Thoroughly test and fix layout issues on mobile devices, ensuring all components render correctly and are usable in an RTL Arabic context. *Critical for target audience.*

*(Other tasks like Payment Integration (#2), full User Profile Management (#7), Admin Analytics (#8), Notifications (#10), and advanced Sync (#11) are important but can be deferred post-MVP).*

## 9. Required Access & Permissions for Completing Agent

*   **Replit Project Access:** Direct access to the Replit project (`https://replit.com/@sehapostmartall/SyriaFoodApp?v=1`), likely requiring collaborator permissions.
*   **File System Access:** Ability to read, create, modify, and delete files and directories within the project structure.
*   **Shell/Terminal Access:** Ability to execute commands in the Replit Shell (e.g., `npm install`, `npm run dev`, `node server/seed.js`, potentially Drizzle migration commands).
*   **Replit Secrets Access:** Ability to *read* the values stored in Replit Secrets (for API keys, database credentials) via environment variables (`process.env` and `import.meta.env`).

## 10. General Requirements & Constraints

*   **Maintain Code Quality & Style:** Adhere to the existing coding style, patterns, and conventions used in the project (TypeScript, React functional components with hooks, Drizzle ORM patterns, etc.).
*   **Error Handling:** Implement robust error handling for new backend and frontend logic.
*   **RTL & Arabic Language:** All new UI elements and user-facing text must be implemented with RTL layout considerations and use Arabic language.
*   **Documentation:** Add comments to complex code sections where necessary.
*   **Testing:** Perform basic functional testing for all implemented features to ensure they work as expected.

-------

secrect for completely controle
=====
Supabase URL:
https://jxjpnmwydldorerjjfhe.supabase.co

Supabase Anon Key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4anBubXd5ZGxkb3JlcmpqZmhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NTU0MjEsImV4cCI6MjA1OTMzMTQyMX0.jx0eS89r6eqf2TJPCiqw_pj34uslPqRZHmVCdBtVZ-o

JWT Secret
V1Cr00DKHizsn2KuXqFnAQ2aLbmbTzcYQ6TbW7CQz/xiO1vg8xxMBohzg/HljzHmzWC00jWlCC+voSRGxlvKYw==

Google Maps API Key : AIzaSyALNa25I6iVPdV6WwI-MdKQ2nQo68lx4C8


Personal Access Token :
sbp_221c03c5a2d31730f9ffd4b15641f14d43889f16

secret
service_role :
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4anBubXd5ZGxkb3JlcmpqZmhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzc1NTQyMSwiZXhwIjoyMDU5MzMxNDIxfQ.-1qglXrDPXkeFHAjYpA3un1cb6RQf6ojO5ecr02jlDU


S3 Access Keys
secret access of S3 Access Keys
f44eaafdb0b0df5b073af2a2e23138c39b946617bf01f55a0f96e885df9714a9

id of S3 Access Keys
ad7b36459eb611fefa632d8c1dc50e00

---------

for more :

The project follows a modern full-stack JavaScript application structure:
Root Directory: Contains configuration files and setup
client/: Frontend React application
server/: Backend Express application
shared/: Common code shared between frontend and backend
attached_assets/: Additional files and resources
Configuration files: package.json, vite.config.ts, drizzle.config.ts, etc.
Client Structure:
client/src/assets/: Static assets like images
client/src/components/: Reusable UI components organized by features
client/src/context/: React context providers (Auth, Cart, WebSocket)
client/src/hooks/: Custom React hooks
client/src/lib/: Utility functions and configurations
client/src/pages/: Page components for each route
client/index.html: Root HTML file
Server Structure:
server/routes/: API route definitions
server/middleware/: Express middleware
server/index.ts: Server entry point
server/routes.ts: Route registration
server/storage.ts: Database access layer
server/db.ts: Database connection
server/supabase.ts: Supabase integration
Shared Structure:
shared/schema.ts: Database schema definitions with Drizzle ORM
shared/types.ts: TypeScript interfaces shared between frontend and backend
2. Project Elements and Components
Authentication System
Uses Supabase for authentication while maintaining synchronization with PostgreSQL database
User roles: customer, restaurant owner, delivery person, admin
Protected routes based on user roles
Restaurant Management
Restaurant listings with categories and menu items
Restaurant owner dashboard for managing orders, menu items, etc.
Rating and review system
Order System
Shopping cart functionality
Checkout process
Order tracking with real-time updates
Delivery System
Real-time order tracking with Google Maps integration
Delivery person assignment
Location updates via WebSocket
Admin Dashboard
User management
Restaurant approval
Order monitoring
Analytics and reporting
WebSocket Integration
Real-time updates for order status
Driver location tracking
Notifications for new orders
3. Technologies and Libraries Used
Frontend
React.js: UI library for building components
TailwindCSS: Utility-first CSS framework for styling
shadcn/ui: Component library built on Radix UI and Tailwind
Framer Motion: Animation library for smooth transitions
TanStack Query: Data fetching and state management
Wouter: Lightweight routing library
React Hook Form: Form validation and submission
Zod: Schema validation
Google Maps API: For location and mapping features
Backend
Node.js with Express: Backend server framework
TypeScript: Static typing for improved developer experience
Drizzle ORM: Database ORM with PostgreSQL
WebSocket (ws): Real-time communication
Supabase: Authentication and storage services
PostgreSQL: Primary database
Express Session: Session management
4. Project Environment
Development Environment
Full-stack application running in Replit
Workflow setup for automatic server restart
PostgreSQL database provisioned through Replit
Configuration
Environment variables managed through Replit Secrets
Available secrets include:
DATABASE_URL
PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT
VITE_GOOGLE_MAPS_API_KEY
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RTL and Arabic Support
RTL layout implemented in CSS
All user-facing text is in Arabic (Syria locale)
Forms and validation messages in Arabic
5. Running the Project
Workflow Setup
The project uses a Replit workflow named "Start application"
This workflow runs npm run dev to start both frontend and backend
Viewing the Application
After starting the workflow, the application is available in the Replit webview
The server runs on port 5000
Real-time functionality is available through WebSocket connection (/ws endpoint)
Current Status
We recently fixed import path issues in several hook files that were causing authentication errors
The application is now properly using relative paths for imports between files
WebSocket connection is established for real-time updates
This project is an RTL Arabic food delivery web application with comprehensive features for customers, restaurant owners, delivery persons, and administrators, with real-time capabilities and proper authentication.




=====
Detailed Project Analysis: Syria Food Delivery App
=====

1. Key File Contents and Logic
server/index.ts
This is the entry point for the Express backend:
// Main imports and server setup
import express from 'express';
import session from 'express-session';
import { registerRoutes } from './routes';
import { errorHandler } from './middleware/error-handler';

// Server initialization
const app = express();
app.use(express.json());

// Session configuration for authentication
app.use(session({
  secret: 'syria-food-delivery-app',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Register all route handlers
const server = await registerRoutes(app);

// Global error handler middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  return res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start the server
server.listen(5000, () => {
  console.log('Server running on port 5000');
});
The file sets up the Express server, configures middleware for JSON parsing and sessions, registers all API routes, sets up error handling, and starts the server on port 5000.
server/routes.ts
This file registers all API routes and sets up WebSocket functionality:
export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server for Express
  const httpServer = createServer(app);

  // Initialize WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // WebSocket connection handler
  wss.on('connection', (ws: WebSocket, req) => {
    const customWs = ws as CustomWebSocket;
    customWs.isAlive = true;

    // Parse session info from request if authenticated
    const sessionId = getSessionFromRequest(req);
    if (sessionId) {
      // Authenticate the WebSocket connection
      // Associate session user data with the WebSocket
    }

    // Handle incoming WebSocket messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle different WebSocket message types 
        // (order_update, driver_location, etc)
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
  });

  // Authentication middleware for protected routes
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session.user) {
      return next();
    }
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  };

  // Register all API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/restaurants', restaurantRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/menu-items', menuItemRoutes);
  app.use('/api/orders', isAuthenticated, orderRoutes);
  app.use('/api/addresses', isAuthenticated, addressRoutes);
  app.use('/api/admin', isAuthenticated, isAdmin, adminRoutes);

  return httpServer;
}
This file is responsible for setting up both HTTP API routes and WebSocket functionality for real-time features. It creates authenticated WebSocket connections, maps users to their connections, and sets up broadcasting for order updates and driver location tracking.
client/src/App.tsx
Main React component that defines routing:
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WebSocketProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/restaurants" element={<RestaurantsPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/popular-dishes" element={<PopularDishesPage />} />
                  <Route path="/popular-restaurants" element={<PopularRestaurantsPage />} />
                  <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />

                  {/* Protected routes */}
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute roles={['customer', 'restaurant', 'delivery', 'admin']}>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/checkout" 
                    element={
                      <ProtectedRoute roles={['customer']}>
                        <CheckoutPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/track-order/:id" 
                    element={
                      <ProtectedRoute roles={['customer', 'restaurant', 'delivery', 'admin']}>
                        <TrackOrderPage />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Admin routes */}
                  <Route 
                    path="/admin/*" 
                    element={
                      <ProtectedRoute roles={['admin']}>
                        <AdminLayout />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Restaurant routes */}
                  <Route 
                    path="/restaurant-dashboard/*" 
                    element={
                      <ProtectedRoute roles={['restaurant']}>
                        <RestaurantLayout />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Delivery routes */}
                  <Route 
                    path="/delivery-dashboard/*" 
                    element={
                      <ProtectedRoute roles={['delivery']}>
                        <DeliveryLayout />
                      </ProtectedRoute>
                    } 
                  />

                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Layout>
            </Router>
          </WebSocketProvider>
        </CartProvider>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
The App component establishes the application's routing architecture, wrapping everything in context providers for global state (Auth, Cart, WebSocket). It defines protected routes with specific role requirements using the ProtectedRoute component.
client/src/context/AuthContext.tsx
Handles authentication state with Supabase:
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on initial load
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get session from Supabase
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // If session exists, fetch user details from our backend
        const response = await fetch('/api/auth/me');
        const result = await response.json();

        if (result.success) {
          setUser(result.data);
        } else {
          // If backend doesn't have user, clear Supabase session
          await supabase.auth.signOut();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function using Supabase
  const login = async (email: string, password: string) => {
    try {
      // Login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // After successful Supabase auth, get user data from our backend
      const response = await fetch('/api/auth/me');
      const result = await response.json();

      if (result.success) {
        setUser(result.data);
        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Similarly with signup, logout functions
  // ...

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        checkAuthStatus();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuthStatus]);

  // Helper functions to check user roles
  const isCustomer = user?.role === 'customer';
  const isRestaurantOwner = user?.role === 'restaurant';
  const isDeliveryPerson = user?.role === 'delivery';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        checkAuthStatus,
        updateUserProfile,
        isCustomer,
        isRestaurantOwner,
        isDeliveryPerson,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
This context provides authentication functionality throughout the application. It handles Supabase authentication while syncing with the backend authentication system. It maintains user state, provides login/signup/logout functions, and offers helper methods for checking user roles.
shared/schema.ts
Defines the database schema with Drizzle ORM:
// Enums for type safety
export const orderStatusEnum = pgEnum('order_status', ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'on_delivery', 'delivered', 'cancelled']);
export const userRoleEnum = pgEnum('user_role', ['customer', 'restaurant', 'delivery', 'admin']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['assigned', 'picked_up', 'delivered', 'failed_delivery']);

// User table and relations
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").notNull(),
  role: userRoleEnum("role").notNull().default('customer'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  supabaseId: text("supabase_id").unique(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  addresses: many(addresses),
  restaurant: one(restaurants, { fields: [users.id], references: [restaurants.ownerId] }),
  orders: many(orders),
}));

// Address table and relations
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(), // e.g., "Home", "Work"
  address: text("address").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
});

// Additional tables and their relations...
// ... restaurants, categories, menuItems, orders, orderItems, etc.

// Schema validation with Zod
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const selectUserSchema = createSelectSchema(users);

// ... same for other tables

// TypeScript types 
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// ... same for other tables
This file defines the database schema using Drizzle ORM. It creates tables for users, addresses, restaurants, categories, menu items, orders, etc., and defines their relationships. It also provides Zod validation schemas and TypeScript types for each table.
2. Detailed Project Tree
├── attached_assets
│   ├── moredetails.txt
│   ├── projectinfo.txt
│   └── prompt*.txt (multiple files)
├── client
│   ├── index.html
│   └── src
│       ├── assets
│       │   └── (images and static resources)
│       ├── components
│       │   ├── admin
│       │   │   ├── AdminLayout.tsx
│       │   │   ├── AdminSidebar.tsx
│       │   │   └── (other admin components)
│       │   ├── common
│       │   │   ├── Button.tsx
│       │   │   ├── GoogleMap.tsx
│       │   │   ├── ProtectedRoute.tsx
│       │   │   └── (other common components)
│       │   ├── delivery
│       │   │   └── (delivery person components)
│       │   ├── layout
│       │   │   ├── Footer.tsx
│       │   │   ├── Header.tsx
│       │   │   └── Sidebar.tsx
│       │   ├── restaurant
│       │   │   └── (restaurant owner components)
│       │   └── ui
│       │       └── (shadcn UI components)
│       ├── context
│       │   ├── AuthContext.tsx
│       │   ├── CartContext.tsx
│       │   └── WebSocketContext.tsx
│       ├── hooks
│       │   ├── use-mobile.tsx
│       │   ├── use-toast.ts
│       │   ├── useAuth.ts
│       │   ├── useCart.tsx
│       │   └── useOrderTracking.ts
│       ├── lib
│       │   ├── queryClient.ts
│       │   ├── supabase.ts
│       │   └── utils.ts
│       ├── pages
│       │   ├── admin
│       │   │   ├── DashboardPage.tsx
│       │   │   ├── OrdersPage.tsx
│       │   │   ├── RestaurantsPage.tsx
│       │   │   └── UsersPage.tsx
│       │   ├── delivery
│       │   │   ├── DashboardPage.tsx
│       │   │   └── OrdersPage.tsx
│       │   ├── restaurant
│       │   │   ├── DashboardPage.tsx
│       │   │   ├── MenuPage.tsx
│       │   │   └── OrdersPage.tsx
│       │   ├── CategoriesPage.tsx
│       │   ├── CheckoutPage.tsx
│       │   ├── HomePage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── not-found.tsx
│       │   ├── PopularDishesPage.tsx
│       │   ├── PopularRestaurantsPage.tsx
│       │   ├── ProfilePage.tsx
│       │   ├── RestaurantDetailsPage.tsx
│       │   ├── RestaurantsPage.tsx
│       │   ├── SignupPage.tsx
│       │   ├── TrackOrderPage.tsx
│       │   └── UnauthorizedPage.tsx
│       ├── App.tsx
│       ├── index.css
│       └── main.tsx
├── server
│   ├── db.ts
│   ├── index.ts
│   ├── middleware
│   │   ├── auth-middleware.ts
│   │   └── error-handler.ts
│   ├── routes
│   │   ├── admin.ts
│   │   ├── auth.ts
│   │   ├── categories.ts
│   │   ├── delivery.ts
│   │   ├── menu-items.ts
│   │   ├── orders.ts
│   │   ├── restaurants.ts
│   │   └── users.ts
│   ├── routes.ts
│   ├── storage.ts
│   ├── supabase.ts
│   └── vite.ts
├── shared
│   ├── schema.ts
│   └── types.ts
├── .env
├── .gitignore
├── .replit
├── drizzle.config.ts
├── package.json
├── package-lock.json
├── postcss.config.js
├── replit.nix
├── tailwind.config.ts
├── theme.json
├── tsconfig.json
└── vite.config.ts
3. Relationship and Interaction Details
Frontend-Backend Interaction
1.	Restaurant Listing Flow:
•	When the RestaurantsPage component loads, useQuery hook fetches from /api/restaurants
•	API request is handled by server/routes/restaurants.ts
•	Backend uses storage.getRestaurants() to retrieve data
•	Data is returned to frontend and stored in query cache
•	React components render the restaurant data
2.	Authentication Flow:
•	User enters credentials in LoginPage
•	login() function from AuthContext is called
•	Frontend sends credentials to Supabase Auth
•	On successful Supabase authentication, backend /api/auth/me is called
•	Backend validates user and returns user details
•	AuthContext updates state with user information
•	Protected routes become accessible based on user role
3.	Order Placement Flow:
•	User adds items to cart via useCart() hook
•	On checkout, CheckoutPage collects delivery information
•	Checkout form submits to /api/orders
•	Backend creates order record in database
•	WebSocket sends notifications to restaurant dashboard
Authentication Integration
The system uses a dual authentication approach:
1.	Supabase Auth:
•	Handles primary authentication (signup, login, password reset)
•	Manages authentication state with JWT tokens
•	Provides session management and persistence
2.	Backend Session:
•	Syncs user data between Supabase and PostgreSQL
•	Maintains user role and permission information
•	Handles server-side authorization for API endpoints
The integration works by:
•	On login, authenticating first with Supabase
•	After successful Supabase auth, verifying user in backend
•	Creating Express session for backend authentication
•	Maintaining user data consistency between both systems
Backend-Database Interaction
1.	Data Access Layer:
•	storage.ts defines DatabaseStorage class implementing IStorage interface
•	All database operations are abstracted through this interface
•	Route handlers never directly access the database
2.	Drizzle ORM Usage:
•	Tables and relationships defined in shared/schema.ts
•	db.ts establishes database connection using Drizzle
•	Query building with Drizzle's type-safe APIs
•	Transaction support for operations requiring multiple changes
Example of database interaction:
// Route handler
router.get('/restaurants', async (req, res) => {
  try {
    const search = req.query.search as string;
    const categoryId = Number(req.query.categoryId) || undefined;

    // Use storage interface to get data
    const restaurants = await storage.getRestaurants(search, categoryId);

    return res.json({ success: true, data: restaurants });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Storage implementation
async getRestaurants(search?: string, categoryId?: number): Promise<Restaurant[]> {
  let query = db.select().from(restaurants);

  if (search) {
    query = query.where(ilike(restaurants.name, `%${search}%`));
  }

  if (categoryId) {
    query = query.where(eq(restaurants.categoryId, categoryId));
  }

  return await query;
}
4. Remaining Tasks and Unimplemented Features
High Priority (MVP)
1.	Order Management:
•	Complete order processing workflow
•	Restaurant order acceptance functionality
•	Order status update notifications
2.	Payment Integration:
•	Payment method selection
•	Integration with payment gateway
•	Order confirmation after payment
3.	Real-time Tracking:
•	Complete driver location tracking
•	Estimated delivery time calculation
•	Route visualization on map
Medium Priority
1.	User Reviews and Ratings:
•	Restaurant rating system
•	User review submission
•	Review moderation by admin
2.	Restaurant Management Tools:
•	Menu item management
•	Working hours configuration
•	Special offer/promotion creation
3.	Delivery Person Interface:
•	Order pickup confirmation
•	Navigation integration
•	Delivery confirmation with proof
Low Priority
1.	Customer Loyalty Program:
•	Points accumulation
•	Rewards redemption
•	Special offers for regular customers
2.	Multi-language Support:
•	Currently only Arabic, potentially add English
•	Language preference setting
3.	Advanced Analytics:
•	Revenue projections
•	Customer behavior analysis
•	Performance metrics for restaurants and delivery persons
5. Drizzle ORM and Database Relationships
Table Definitions
Drizzle ORM is used to define the database schema in a type-safe manner. Each table is defined using pgTable:
export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  coverImage: text("cover_image"),
  address: text("address").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  phone: text("phone").notNull(),
  ownerId: integer("owner_id").references(() => users.id),
  categoryId: integer("category_id").references(() => categories.id),
  isActive: boolean("is_active").notNull().default(true),
  averageRating: doublePrecision("average_rating").default(0),
  ratingCount: integer("rating_count").default(0),
  priceLevel: integer("price_level").default(2),
  preparationTime: integer("preparation_time").default(30),
});
Relationship Definitions
Relationships between tables are explicitly defined using the relations function:
export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  menuItems: many(menuItems),
  orders: many(orders),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id],
  }),
  orderItems: many(orderItems),
}));
These relationship definitions enable:
1.	Type-safe queries with proper joins
2.	Automatic type inference for related entities
3.	Better developer experience with autocompletion
Complex Queries and Joins
Using Drizzle's relationship definitions allows for complex queries:
// Example: Get restaurant with menu items
async getRestaurantWithMenu(id: number): Promise<RestaurantWithMenu | undefined> {
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, id));

  if (!restaurant) return undefined;

  const menuItems = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.restaurantId, id));

  return {
    ...restaurant,
    menuItems,
  };
}
The database schema defines one-to-many and many-to-many relationships:
•	Users to Addresses (one-to-many)
•	Restaurants to Menu Items (one-to-many)
•	Orders to Order Items (one-to-many)
•	Restaurants to Categories (many-to-many through a join table)
This allows for complex data modeling while maintaining type safety throughout the application.







=====
Specific Programming Tasks Still Pending
=====
1. WebSocket Implementation for Real-time Order Tracking
What was the intended task?
Complete the WebSocket implementation for real-time order tracking, particularly for driver location updates and order status changes.
Why is it important for the project?
Real-time tracking is a core feature of food delivery apps. Users need to know where their food is, restaurants need to know when orders are picked up, and delivery persons need to broadcast their location.
Current status:
Partially implemented. The WebSocket server is set up in server/routes.ts, but the client-side integration in the order tracking page is incomplete. Location history tracking is implemented in useOrderTracking.ts but not fully functional. The WebSocket message handlers need to be completed.
2. Payment Integration
What was the intended task?
Implement payment processing functionality for the checkout flow.
Why is it important for the project?
Payment is a critical part of the order process. Without it, users can't complete their purchases.
Current status:
Missing. The checkout form includes a placeholder for payment method selection, but no actual payment processing is implemented. Backend routes for payment verification are also missing.
3. Order Management for Restaurant Owners
What was the intended task?
Create a complete interface for restaurant owners to view incoming orders, update their status, and manage their restaurant profile.
Why is it important for the project?
Restaurant owners need to manage their menu, accept/reject orders, and update preparation status.
Current status:
Partially implemented. The restaurant dashboard basic structure exists, but functionality for accepting orders, updating status, and managing menu items is incomplete.
4. Delivery Person Interface
What was the intended task?
Build a complete interface for delivery personnel to view assigned orders, update delivery status, and share their location.
Why is it important for the project?
The delivery interface is essential for order fulfillment and tracking.
Current status:
Partially implemented. The basic dashboard exists but functionality for updating order status, marking deliveries as complete, and sharing location updates is incomplete.
5. Google Maps Integration for Route Visualization
What was the intended task?
Implement route visualization on Google Maps to show the delivery path from restaurant to customer.
Why is it important for the project?
Visual route tracking enhances the user experience and helps customers understand delivery timing.
Current status:
Partially implemented. The GoogleMap component exists but doesn't include route visualization between points. The DirectionsService from Google Maps API isn't fully utilized.
6. Data Seeding and Sample Content
What was the intended task?
Create a database seeding script to populate the application with sample restaurants, menu items, and categories.
Why is it important for the project?
Without sample data, new users see empty pages, which doesn't demonstrate the app's functionality.
Current status:
Missing. No data seeding script exists, resulting in empty listings when the app is first installed.
7. User Profile Management
What was the intended task?
Implement complete user profile management, including profile editing, password changes, and address management.
Why is it important for the project?
Users need to maintain their information and delivery addresses.
Current status:
Partially implemented. The profile page exists but functionality for editing user information and managing multiple addresses is incomplete.
8. Admin Dashboard Analytics
What was the intended task?
Implement detailed analytics in the admin dashboard showing order volumes, revenue, popular restaurants, etc.
Why is it important for the project?
Analytics help administrators understand platform usage and make business decisions.
Current status:
Partially implemented. Basic admin interface exists but lacks comprehensive data visualization and analytics reports.
9. Form Validation with Arabic Error Messages
What was the intended task?
Implement comprehensive form validation with culturally appropriate Arabic error messages.
Why is it important for the project?
Since the application targets Syrian users, proper Arabic error messages are critical for user experience.
Current status:
Partially implemented. Some forms have validation, but Arabic error messages are incomplete or missing in many places.
10. Notifications System
What was the intended task?
Implement a notification system for order updates, special offers, and other important events.
Why is it important for the project?
Users need to be informed about order status changes and other important events.
Current status:
Missing. The notification infrastructure is not implemented in the front or backend.
11. Complete Supabase-PostgreSQL Data Synchronization
What was the intended task?
Ensure complete data synchronization between Supabase authentication and the application's PostgreSQL database.
Why is it important for the project?
With the dual authentication approach, it's critical that user data stays consistent between systems.
Current status:
Partially implemented. Basic synchronization exists, but edge cases like account deletion or role changes aren't fully handled.
12. Mobile Responsiveness for RTL Layout
What was the intended task?
Ensure complete mobile responsiveness for all pages with proper RTL (Right-to-Left) layout for Arabic content.
Why is it important for the project?
Many users will access the application via mobile devices, and proper RTL support is essential for Arabic language users.
Current status:
Partially implemented. Basic RTL support exists, but some components don't properly adjust for mobile screens in RTL mode.
This list identifies the key programming tasks that need to be completed to bring the Syria Food Delivery App closer to a fully functional state. Each task addresses a specific aspect of the application that's currently missing or incomplete.


======
 "Specific Programming Tasks Still Pending"
======

Strategic Roadmap for Completing the Syria Food Delivery App
1. Task Prioritization
Here are the most critical tasks ranked in order of priority for achieving a Minimum Viable Product (MVP):
1.	Data Seeding and Sample Content (Task #6)
•	Reasoning: Without sample data, users can't meaningfully interact with the application or test any functionality. This is the foundation for demonstrating and testing all other features.
2.	Order Management for Restaurant Owners (Task #3)
•	Reasoning: This is a core functionality that enables the basic business flow. Restaurants must be able to receive and process orders for the application to fulfill its primary purpose.
3.	Delivery Person Interface (Task #4)
•	Reasoning: Completes the order fulfillment cycle. Without this, orders can be placed but not delivered, breaking the fundamental value proposition of the app.
4.	WebSocket Implementation for Real-time Order Tracking (Task #1)
•	Reasoning: Real-time updates are a crucial differentiator for food delivery apps and significantly enhance user experience by providing visibility into order status.
5.	Google Maps Integration for Route Visualization (Task #5)
•	Reasoning: This provides essential visual feedback for delivery tracking and improves the user experience with geographical context for deliveries.
6.	Form Validation with Arabic Error Messages (Task #9)
•	Reasoning: As this application targets Syrian users, proper Arabic validation messages are essential for usability and user experience.
7.	Mobile Responsiveness for RTL Layout (Task #12)
•	Reasoning: Most users will likely access the application via mobile devices, making this a critical usability factor for the target market.
2. Task Sequencing and Dependencies
Dependency Map:
Data Seeding (#6) → Order Management (#3) → Delivery Interface (#4) → WebSocket Implementation (#1) → Maps Integration (#5)
Optimal Sequence:
1.	First Phase: Foundation
•	Complete Data Seeding (#6)
•	Implement Form Validation with Arabic Messages (#9)
•	Enhance Mobile Responsiveness for RTL (#12)
2.	Second Phase: Core Business Logic
•	Complete Order Management for Restaurants (#3)
•	Implement Delivery Person Interface (#4)
3.	Third Phase: Enhanced Experience
•	Integrate WebSocket for Real-time Updates (#1)
•	Complete Google Maps Integration (#5)
4.	Fourth Phase: Additional Features (later)
•	Payment Integration (#2)
•	User Profile Management (#7)
•	Admin Dashboard Analytics (#8)
•	Notifications System (#10)
•	Supabase-PostgreSQL Synchronization (#11)
3. Efficiency and Simplification Strategies
Simplifications for MVP:
1.	For Data Seeding (#6):
•	Create a simple script with a fixed set of restaurants, menu items, and categories rather than an elaborate admin interface for content management
•	Focus on high-quality data for 3-5 restaurants instead of a large quantity
2.	For Order Management (#3):
•	Initially implement basic status updates (accept/reject/complete) without advanced features like time estimation or special instructions
•	Use simple list views before implementing complex filtering or sorting
3.	For Delivery Interface (#4):
•	Start with manual status updates (picked up/delivered) before implementing automated location tracking
•	Use simplified map views with markers instead of complex route visualization initially
4.	For WebSocket Implementation (#1):
•	Focus on critical updates only (order status changes, basic location updates)
•	Defer more complex features like typing indicators or chat functionality
5.	Deferrable Features:
•	Payment processing can initially use a "Cash on Delivery" option only
•	Admin analytics can start with basic counts rather than complex charts
•	Notifications can begin with in-app only before adding push notifications
4. Technology and Implementation Approaches
For Data Seeding (#6):
Technology: Use Drizzle's seeding capabilities with a simple Node.js script.
Approach:
// Example seed script structure
import { db } from '../server/db';
import { users, restaurants, menuItems, categories } from '../shared/schema';

async function seed() {
  // Insert categories
  const [foodCategory, drinksCategory] = await db.insert(categories).values([
    { name: 'الطعام', imageUrl: '/images/categories/food.svg' },
    { name: 'المشروبات', imageUrl: '/images/categories/drinks.svg' },
  ]).returning();

  // Insert restaurants
  const [restaurant1] = await db.insert(restaurants).values([
    { 
      name: 'مطعم دمشق', 
      description: 'أشهى المأكولات السورية التقليدية',
      address: 'شارع الثورة، دمشق',
      lat: 33.513,
      lng: 36.292,
      phone: '+963112345678',
      categoryId: foodCategory.id,
      // Other fields...
    }
  ]).returning();

  // Insert menu items
  await db.insert(menuItems).values([
    {
      name: 'شاورما دجاج',
      description: 'شاورما دجاج مع صلصة الثوم والخضار',
      price: 8.50,
      imageUrl: '/images/menu/shawarma.jpg',
      restaurantId: restaurant1.id,
      categoryId: foodCategory.id,
    }
    // More items...
  ]);
}

seed().catch(console.error);
For Order Management (#3):
Technology: React Query for data fetching, shadcn UI components, WebSocket for real-time updates.
Approach:
// RestaurantOrdersPage.tsx
export default function RestaurantOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/restaurant/orders'],
    refetchInterval: 30000, // Fallback polling if WebSocket fails
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      return apiRequest(`/api/restaurant/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/restaurant/orders'] });
      toast({
        title: "تم تحديث حالة الطلب",
        description: "تم تحديث حالة الطلب بنجاح",
      });
    },
  });

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">إدارة الطلبات</h1>

      {isLoading ? (
        <OrdersLoadingSkeleton />
      ) : data?.data?.length > 0 ? (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
            <TabsTrigger value="accepted">مقبولة</TabsTrigger>
            <TabsTrigger value="preparing">قيد التحضير</TabsTrigger>
            <TabsTrigger value="ready">جاهزة للاستلام</TabsTrigger>
            <TabsTrigger value="completed">مكتملة</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <OrdersList 
              orders={data.data.filter(o => o.status === 'pending')}
              onUpdateStatus={(orderId, status) => 
                updateOrderStatusMutation.mutate({ orderId, status })
              }
            />
          </TabsContent>
          {/* Other tabs content */}
        </Tabs>
      ) : (
        <EmptyState 
          title="لا توجد طلبات"
          description="لم تتلق أي طلبات بعد"
          icon={<Utensils className="h-10 w-10" />}
        />
      )}
    </div>
  );
}
For WebSocket Implementation (#1):
Technology: Use the existing WS library, React Context for state management.
Approach:
// Enhanced WebSocketContext.tsx
export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      console.log('WebSocket connection established');

      // Authenticate the WebSocket connection
      ws.send(JSON.stringify({
        type: 'auth',
        userId: user.id,
        role: user.role,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
        console.log('WebSocket message received:', message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('WebSocket connection closed');
    };

    setSocket(ws);

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [user]);

  // Send message function
  const sendMessage = useCallback((message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  }, [socket]);

  // Context value
  const value = {
    connected,
    lastMessage,
    sendMessage,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
For Google Maps Integration (#5):
Technology: Google Maps JavaScript API, React components.
Approach:
// Enhanced GoogleMap.tsx
export default function GoogleMap({
  deliveryLocation,
  driverLocation,
  restaurantLocation,
  height = '400px',
  zoom = 14,
  showRoute = false,
  className,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const newMap = new google.maps.Map(mapRef.current, {
      center: restaurantLocation || { lat: 33.5138, lng: 36.2765 }, // Damascus
      zoom,
      streetViewControl: false,
    });

    setMap(newMap);

    // Initialize directions renderer if showing routes
    if (showRoute) {
      const renderer = new google.maps.DirectionsRenderer({
        map: newMap,
        suppressMarkers: true,
      });
      setDirectionsRenderer(renderer);
    }
  }, [zoom, restaurantLocation, showRoute]);

  // Update markers and routes
  useEffect(() => {
    if (!map) return;

    // Clear previous markers
    map.data.forEach(feature => {
      map.data.remove(feature);
    });

    // Add markers
    const bounds = new google.maps.LatLngBounds();

    if (restaurantLocation) {
      addMarker('restaurant', restaurantLocation);
      bounds.extend(restaurantLocation);
    }

    if (deliveryLocation) {
      addMarker('delivery', deliveryLocation);
      bounds.extend(deliveryLocation);
    }

    if (driverLocation) {
      addMarker('driver', driverLocation);
      bounds.extend(driverLocation);
    }

    // Fit map to bounds if we have multiple locations
    if (bounds.isEmpty() === false) {
      map.fitBounds(bounds);
    }

    // Show route if requested and we have the necessary points
    if (showRoute && directionsRenderer && restaurantLocation && 
        (deliveryLocation || driverLocation)) {
      const directionsService = new google.maps.DirectionsService();

      directionsService.route({
        origin: restaurantLocation,
        destination: deliveryLocation || driverLocation!,
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
        }
      });
    }

    // Function to add a marker
    function addMarker(type: 'restaurant' | 'delivery' | 'driver', position: Position) {
      const iconUrl = type === 'restaurant' 
        ? '/images/restaurant-marker.svg'
        : type === 'delivery' 
        ? '/images/home-marker.svg' 
        : '/images/driver-marker.svg';

      const marker = new google.maps.Marker({
        position,
        map,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(40, 40),
        }
      });

      return marker;
    }
  }, [map, restaurantLocation, deliveryLocation, driverLocation, showRoute, directionsRenderer]);

  return (
    <div 
      ref={mapRef} 
      className={cn("w-full rounded-md", className)} 
      style={{ height }}
    />
  );
}
5. Testing Strategy Integration
Testing Approach by Phase:
1.	Foundation Phase Testing:
•	Unit Tests: For form validation logic and data seeding functions
•	Manual Testing: For RTL layout and mobile responsiveness across various devices
•	Visual Testing: For Arabic text rendering and RTL layout correctness
2.	Core Business Logic Phase Testing:
•	Integration Tests: For order flow from creation to restaurant acceptance to delivery
•	E2E Scenarios: Complete order placement and fulfillment flows
•	User Testing: With Arabic-speaking users to validate cultural aspects
3.	Enhanced Experience Phase Testing:
•	WebSocket Tests: For connection reliability and message handling
•	Map Integration Tests: For correct location display and route rendering
Testing Tools:
•	Unit Testing: React Testing Library and Jest for frontend components
•	API Testing: Supertest for backend API routes
•	E2E Testing: Manual testing for MVP, potentially Cypress for later phases
•	Performance: Browser dev tools for WebSocket and map rendering performance
Testing Best Practices:
1.	Test Arabic Content:
•	Ensure all forms, validation messages, and UI elements properly support Arabic text
•	Test with long and short Arabic text to catch layout issues
2.	Mobile-First Testing:
•	Test extensively on mobile devices before desktop
•	Pay special attention to touch interactions and small screen layouts
3.	Real-time Feature Testing:
•	Use multiple browser windows to simulate different users (customer, restaurant, delivery)
•	Test with intentionally slow connections to ensure graceful fallbacks
4.	Database Testing:
•	Create test fixtures that match the seed data
•	Test queries with Arabic text to ensure proper handling of Unicode
By following this strategic roadmap, you'll be able to efficiently complete the remaining tasks for the Syria Food Delivery App in a logical sequence that builds upon each previous step. Focusing on the prioritized tasks will quickly get you to a functional MVP that can be tested and refined before adding more advanced features.
