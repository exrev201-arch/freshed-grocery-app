# This file is only for editing file nodes, do not break the structure
## Project Description
Fresh is a modern grocery delivery platform specifically designed for Dar es Salaam. Users can browse fresh vegetables, fruits, dairy, grains, and herbs, add items to their cart, and enjoy convenient delivery. The app features organic green branding, mobile-first design, and seamless shopping experience.

## Key Features
- Product Catalog: Browse by category with rich product imagery and descriptions
- Shopping Cart: Add/remove items with local storage persistence across sessions
- User Authentication: Email OTP login with profile management and favorites
- Checkout System: Complete delivery details form with payment method selection
- Order Management: Full order history with status tracking, confirmation pages, and delivery processing
- Delivery System: Complete delivery tracking with personnel assignment and location updates
- Modern Design: Fresh green branding with mobile-optimized responsive layout
- Search & Filter: Find products quickly by category or search functionality
- Price Display: Clear TZS currency formatting for local users
- Admin Dashboard: Complete product and inventory management with role-based access
- Employee Management: Admin user creation with role permissions (admin, manager, employee)
- Data Migration: Smart transition from mock data to database products

## Data Storage
**Tables:**
- user_profiles (exh5nuvwndhc): stores user profile data (name, phone, address, preferences)
- user_favorites (exh5o5io35s0): stores user's favorite products with product details
- orders (exh5z3skm3nk): stores customer orders with delivery details and payment info
- order_items (exh601l45xc0): stores individual items within each order
- products (exh6kcs3nf9c): stores product catalog with inventory tracking and management
- admin_users (exh6knieg4cg): stores admin and employee accounts with role-based access
- delivery_tracking (exh7uwrxj5kw): stores delivery personnel assignments with real-time GPS tracking, location history, and delivery status

**Local:** Shopping cart state (Zustand with localStorage persistence)

## SDK & External Services
**Devv SDK:** Authentication (email OTP), Database (user profiles and favorites tables)
**External APIs:** None currently

## Special Requirements
Tanzania market focus with TZS currency, Dar es Salaam delivery area, mobile-first design for urban users

## Recent Updates
- Enhanced delivery tracking with real-time GPS location updates
- Added LiveDeliveryTracker component with automatic refresh and location history
- Created DeliveryPersonInterface for delivery personnel with GPS tracking and route management
- Implemented real-time location updates with automatic interval updates
- Added DeliveryPage with dual interface (customer tracking vs delivery person workflow)
- Enhanced delivery_tracking table with current_location, estimated_arrival, and distance_remaining fields
- Added Google Maps integration for location viewing
- Implemented location accuracy indicators and auto-updating delivery status
- Fixed assign delivery button functionality and admin dashboard table queries

/src
├── assets/          # Static resources directory
│
├── components/      # Components directory
│   ├── ui/         # Pre-installed shadcn/ui components
│
├── hooks/          # Custom Hooks directory
│   ├── use-mobile.ts # Mobile detection Hook
│   └── use-toast.ts  # Toast notification system Hook
│
├── lib/            # Utility library directory
│   └── utils.ts    # Utility functions, including cn function for merging Tailwind classes
│
├── pages/          # Page components directory (React Router structure)
│   ├── HomePage.tsx # Complete grocery marketplace with hero, catalog, cart, database integration
│   ├── CheckoutPage.tsx # Comprehensive checkout with delivery and payment forms
│   ├── OrderConfirmationPage.tsx # Order success page with details and tracking link
│   ├── DeliveryPage.tsx # Dual-interface delivery tracking (customer/delivery person)
│   ├── AdminDashboard.tsx # Complete admin interface for product and inventory management
│   └── NotFoundPage.tsx # 404 error page
│
├── store/          # State management directory (Zustand)
│   ├── auth-store.ts # Authentication state with user session persistence
│   └── cart-store.ts # Shopping cart state with localStorage persistence
│
├── components/     # Custom feature components
│   ├── auth/
│   │   ├── LoginModal.tsx # Email OTP authentication modal
│   │   ├── UserProfile.tsx # User profile management with favorites and order history
│   │   └── ProtectedRoute.tsx # Route protection for authenticated features
│   ├── cart/
│   │   └── CartSheet.tsx # Sliding cart panel with add/remove/quantity controls
│   ├── categories/
│   │   └── CategoryNav.tsx # Product category filter navigation
│   ├── layout/
│   │   └── Header.tsx # Main navigation with auth integration, search, cart
│   ├── products/
│   │   └── ProductCard.tsx # Product display with favorites and add-to-cart
│   ├── admin/
│   │   ├── AdminLoginModal.tsx # Admin authentication modal
│   │   └── OrderManagement.tsx # Complete order processing and delivery management
│   ├── orders/
│   │   └── OrderTracker.tsx # Enhanced customer order tracking with live delivery tracking
│   ├── delivery/
│   │   ├── LiveDeliveryTracker.tsx # Real-time GPS tracking with location history and auto-refresh
│   │   └── DeliveryPersonInterface.tsx # GPS tracking interface for delivery personnel
│   └── support/
│       └── CustomerSupport.tsx # Customer support contact and feedback system
│
├── lib/            # Utilities and data
│   ├── mock-data.ts # Product catalog and category data with database migration
│   ├── user-service.ts # User profile and favorites management service
│   ├── order-service.ts # Complete order management with CRUD operations
│   ├── admin-service.ts # Admin and product management operations
│   ├── delivery-service.ts # Enhanced delivery service with real-time GPS tracking, location updates, and delivery workflow
│   ├── data-migration.ts # Migration utility from mock data to database
│   └── utils.ts    # Utility functions
│
├── features/       # Feature modules directory (if any)
│   └── [feature-name]/
│       ├── components/
│       ├── hooks/
│       └── types.ts
│
├── App.tsx         # Root component with React Router configuration
│                   # Add new route configurations in this file
│                   # Includes catch-all route (*) for 404 handling
│
├── main.tsx        # Entry file, renders root component and mounts to DOM
│
├── index.css       # Global styles file with Tailwind config and design system [next: define design system]
│                   # Modify theme colors and design variables in this file
│
└── tailwind.config.js  # Tailwind CSS v3 configuration file