# Elite Ecommerce — Full-Stack MERN Application

A full-stack ecommerce web application converted from the original HTML/CSS/JavaScript codebase into a production-ready **MERN Stack** (MongoDB, Express.js, React.js with Vite, Node.js) platform, preserving 100% of the original **Elite Ecommerce** brand identity, Flipkart-style color scheme, responsive UI layouts, and complete product catalog.

---

## 🌟 Key Converted Features

1. **Brand & Visual Aesthetics**:
   - Preserved original colors: Flipkart Blue (`#2874f0`), Action Orange (`#fb641b`), Warning/Amber (`#ff9f00`), Success Green (`#388e3c`), and Slate background (`#f1f3f6`).
   - Clean Roboto typography, responsive CSS card elevation, micro-animations, and interactive modals.
   - Preserved top delivery location picker, sticky header, and 13 category navigation tabs with FontAwesome icons.

2. **Full-Stack Architecture**:
   - **Frontend**: React 18 with Vite, React Router v6, Axios with credentials, Context API (`AuthContext`, `CartContext`, `WishlistContext`).
   - **Backend**: Node.js & Express.js REST APIs with structured controllers, routes, middleware, and models.
   - **Database**: MongoDB with Mongoose object modeling and indexing.
   - **Security**: Password hashing with `bcryptjs` (salt rounds), JWT authentication, secure HTTP-only cookies, CORS protection, and rate limiting.

3. **Ecommerce Capabilities**:
   - **Product Catalog**: 13 categories (For You, Fashion, Mobiles, Beauty, Electronics, Home, Appliances, Toys, Food, Auto, Sports, Books, Furniture).
   - **Dynamic Search & Filtering**: Real-time keyword search, category filtering, min/max price range filter, and multiple sorting options (Price Low-to-High, High-to-Low, Rating).
   - **Product Detail**: Image gallery, pricing, discount calculator, official guarantees checklist (1 Year Warranty, Free Delivery, 7 Days Replacement), and customer reviews.
   - **Product Reviews & Ratings**: Authenticated users can submit star ratings and detailed comments; overall product rating updates automatically on the server.
   - **Cart Management**: Database-backed cart for authenticated users with fallback for guest sessions, item subtotal calculation, interactive quantity buttons, and stock limit validation.
   - **Checkout & Orders**: Multi-step checkout with delivery address selection, payment options (Cash on Delivery or Verified Online Payment), authoritative server-side inventory deduction, and price calculation.
   - **Order Tracking**: Visual status progress tracker (Placed &rarr; Processing &rarr; Shipped &rarr; Delivered) in user's Order History ("My Orders").
   - **Wishlist**: Quick toggle to save favorite products.
   - **User Profile**: Profile settings, mobile number update, and full address book management (add, view, delete addresses).

4. **Database-Backed Admin Dashboard**:
   - **Live Analytics**: Real database metrics for Total Revenue, Total Orders, Catalog Products, Registered Users, and low stock inventory alerts.
   - **Product Management**: Full CRUD (Add Product with image upload/URL, Edit details, Delete, Update inventory).
   - **Order Management**: View customer orders, shipping addresses, items snapshot, and update status (`Placed` &rarr; `Processing` &rarr; `Shipped` &rarr; `Delivered` &rarr; `Cancelled`).
   - **User Directory**: View registered users and roles.

---

## 📁 Project Structure

```text
elite-ecommerce/
├── client/                     # React Frontend (Vite)
│   ├── public/                 # Static assets (images, fashion, mobiles, electronics)
│   ├── src/
│   │   ├── assets/             # Branding and icons
│   │   ├── components/         # Header, Footer, CategoryNav, ProductCard, AuthModal, ProtectedRoute
│   │   ├── context/            # AuthContext, CartContext, WishlistContext
│   │   ├── pages/              # HomePage, CategoryPage, ProductDetailPage, CartPage,
│   │   │                       # CheckoutPage, OrderSuccessPage, MyOrdersPage, ProfilePage,
│   │   │                       # WishlistPage, AdminDashboardPage
│   │   ├── services/           # Axios API client (api.js)
│   │   ├── App.jsx             # React Router routing
│   │   ├── index.css           # Modern design system & styling
│   │   └── main.jsx            # React root mount
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js          # Reverse proxy to backend API & assets
│
├── server/                     # Express Backend & MongoDB API
│   ├── config/                 # Database connection (db.js with local/memory fallback)
│   ├── controllers/            # auth, user, product, category, cart, order, review, admin
│   ├── middleware/             # JWT auth, role authorization, upload (multer), error handler
│   ├── models/                 # User, Category, Product, Cart, Order, Review
│   ├── routes/                 # Express REST route endpoints
│   ├── scripts/                # Database seeder (seed.js) & data migration (migrate.js)
│   ├── utils/                  # JWT token & cookie utilities
│   ├── .env.example            # Environment template
│   ├── package.json
│   └── server.js               # Express application entry point
│
├── README.md                   # Full documentation & setup guide
└── .gitignore
```

---

## ⚙️ Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended). Check with `node -v`.
- **npm**: v9.0.0 or higher. Check with `npm -v`.
- **MongoDB**: Local MongoDB instance (running on port 27017) OR a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud connection URI.
  *(Note: The server also contains an automated in-memory MongoDB fallback for immediate zero-config testing if a local MongoDB service is not started).*

---

## 🚀 Installation & Setup

Open **Windows PowerShell** and run the following commands:

### 1. Backend Setup
```powershell
cd c:\Users\saisr\Desktop\projects\Elite-Fsd\elite-ecommerce\server
npm install
```

### 2. Frontend Setup
```powershell
cd c:\Users\saisr\Desktop\projects\Elite-Fsd\elite-ecommerce\client
npm install
```

---

## 🔑 Environment Configuration

### Backend Configuration (`server/.env`)
Copy or create `server/.env` based on `server/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/elite_ecommerce
JWT_SECRET=elite_ecommerce_super_secret_jwt_key_2026_change_in_production
CLIENT_URL=http://localhost:5173
COOKIE_SECRET=elite_ecommerce_cookie_secret_salt_2026
NODE_ENV=development
USE_MEMORY_DB=auto
```

> **Using MongoDB Atlas**: Replace `MONGODB_URI` with your connection string:
> `mongodb+srv://<username>:<password>@cluster0.mongodb.net/elite_ecommerce?retryWrites=true&w=majority`

### Frontend Configuration (`client/.env`)
```env
VITE_API_URL=
```
*(Leave empty during development to utilize the Vite reverse proxy configured in `vite.config.js`)*.

---

## 📦 Database Seeding & Initial Accounts

Run the database seeder to populate all categories, products, the Administrator, and a Demo Customer:

```powershell
cd c:\Users\saisr\Desktop\projects\Elite-Fsd\elite-ecommerce\server
npm run seed
```

### Default Accounts Created:

| Role | Email | Password | Privileges |
|---|---|---|---|
| **Administrator** | `admin@elite.com` | `Admin@12345` | Full Admin Portal (`/admin`), Product CRUD, Order Status Management, Analytics |
| **Demo Customer** | `customer@elite.com` | `Customer@12345` | Product Browsing, Cart, Checkout, Order Tracking, Wishlist, Reviews |

*(Tip: In the login modal, you can click the **Admin** or **Customer** shortcut buttons to automatically fill credentials).*

---

## 🏃 Running the Application

### Option A: Run Backend Server
In the first PowerShell window:
```powershell
cd c:\Users\saisr\Desktop\projects\Elite-Fsd\elite-ecommerce\server
npm start
```
The server will start at `http://localhost:5000`.

### Option B: Run React Frontend
In a second PowerShell window:
```powershell
cd c:\Users\saisr\Desktop\projects\Elite-Fsd\elite-ecommerce\client
npm run dev
```
The React frontend will start at `http://localhost:5173`. Open this URL in your web browser.

---

## 🔄 Migrating Existing localStorage Data

If you have historical products or user cart data exported from the original browser `localStorage`:

1. Export the data as JSON (e.g. from `localStorage.getItem("allProducts")`).
2. Save it to `server/scripts/exported_localstorage.json`.
3. Run the migration script:
```powershell
cd c:\Users\saisr\Desktop\projects\Elite-Fsd\elite-ecommerce\server
npm run migrate
```
The migration script:
- Normalizes image paths to `/images/...`, `/fashion/...`, etc.
- Validates product structure and prices.
- Prevents duplicate product entries.
- Automatically saves new items to MongoDB.

---

## 📡 REST API Endpoints Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Login with email/mobile and password |
| `POST` | `/api/auth/logout` | Private | Logout and clear HTTP-only auth cookie |
| `GET` | `/api/auth/me` | Private | Fetch current user session |
| `GET` | `/api/products` | Public | List products (supports `search`, `category`, `minPrice`, `maxPrice`, `sort`, `page`) |
| `GET` | `/api/products/:id` | Public | Product details & related recommendations |
| `GET` | `/api/products/featured` | Public | Featured and suggested products |
| `GET` | `/api/categories` | Public | List all 13 categories |
| `GET` | `/api/cart` | Private | Get user's cart (with server-validated pricing) |
| `POST` | `/api/cart` | Private | Add item to cart |
| `PUT` | `/api/cart/:productId` | Private | Update item quantity |
| `DELETE`| `/api/cart/:productId` | Private | Remove item from cart |
| `POST` | `/api/orders` | Private | Create order with authoritative stock verification |
| `GET` | `/api/orders/my-orders` | Private | Get logged-in user order history |
| `GET` | `/api/orders/:id` | Private | Get order status and tracking details |
| `POST` | `/api/reviews` | Private | Add or update a product review |
| `GET` | `/api/reviews/product/:id` | Public | Get product reviews |
| `GET` | `/api/admin/stats` | Admin | Real-time analytics and revenue metrics |
| `GET` | `/api/admin/orders` | Admin | View all orders across all customers |
| `PUT` | `/api/admin/orders/:id/status`| Admin | Update order status (`Placed` &rarr; `Processing` &rarr; `Shipped` &rarr; `Delivered`) |
| `POST` | `/api/admin/products` | Admin | Add new product with image upload |
| `PUT` | `/api/admin/products/:id` | Admin | Edit product information or stock |
| `DELETE`| `/api/admin/products/:id` | Admin | Delete product |
| `GET` | `/api/admin/users` | Admin | View registered users |

---

## 🔒 Security Best Practices Implemented

- **Password Encryption**: All passwords hashed using `bcryptjs` with salt rounds. Plaintext passwords are never stored or logged.
- **HTTP-Only Cookies**: JWT authentication tokens are sent and verified via secure `httpOnly` cookies, preventing XSS token theft.
- **Authoritative Price & Stock Calculations**: Frontend prices and totals are never trusted. The server recalculates subtotals and checks live inventory in MongoDB before order placement.
- **Input Sanitization & Validation**: Validation on all authentication, address, product, and review inputs.
- **Admin Role Guarding**: Admin routes are secured by backend middleware (`authorize('admin')`), not just frontend route redirects.
- **CORS Protection**: Restricted to configured frontend origins (`http://localhost:5173`).
- **File Upload Verification**: Multer middleware checks file extensions and mimetypes, preventing executable uploads.

---

## 🚀 Deployment Guidelines

### 1. Production Build
```powershell
cd client
npm run build
```
This generates an optimized production bundle in `client/dist`.

### 2. Serving Frontend from Express (Optional Single-Server Deployment)
To serve the React client directly from the Node/Express server in production:
Add the static middleware to `server/server.js`:
```javascript
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
});
```

### 3. Deploying to Cloud Providers
- **Database**: Host MongoDB on MongoDB Atlas.
- **Backend**: Deploy `server/` to Render, Railway, AWS EC2, or Heroku.
- **Frontend**: Deploy `client/` to Vercel, Netlify, or AWS S3 + CloudFront (setting `VITE_API_URL` to your production backend URL).
