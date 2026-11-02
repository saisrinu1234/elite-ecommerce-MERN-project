const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/error');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Auto-seed helper
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
const { categoriesData, productsData } = require('./scripts/seedData');

const app = express();

// Security & Parsing Middleware
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  })
);

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate Limiting for sensitive auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api/auth/login', authLimiter);

// Static Asset Directories
// 1. Uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// 2. Serve static image folders from server public or original project assets
const rootProjectDir = path.join(__dirname, '../../');
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/images', express.static(path.join(rootProjectDir, 'images')));
app.use('/fashion', express.static(path.join(__dirname, 'public/fashion')));
app.use('/fashion', express.static(path.join(rootProjectDir, 'fashion')));
app.use('/mobiles', express.static(path.join(__dirname, 'public/mobiles')));
app.use('/mobiles', express.static(path.join(rootProjectDir, 'mobiles')));
app.use('/electronics', express.static(path.join(__dirname, 'public/electronics')));
app.use('/electronics', express.static(path.join(rootProjectDir, 'electronics')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'Elite Ecommerce API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Auto-seed database if empty on startup
const autoSeedIfEmpty = async () => {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial categories and products...');
      await Category.insertMany(categoriesData);
      await Product.insertMany(productsData);

      // Create Admin
      await User.create({
        name: 'Elite Administrator',
        email: 'admin@elite.com',
        password: 'Admin@12345',
        phone: '9876543210',
        role: 'admin',
        addresses: [
          {
            name: 'Elite HQ',
            phone: '9876543210',
            street: 'Outer Ring Road, Devarabeesanahalli Village',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560103',
            country: 'India',
            isDefault: true
          }
        ]
      });

      // Create Demo User
      await User.create({
        name: 'Rahul Sharma',
        email: 'customer@elite.com',
        password: 'Customer@12345',
        phone: '9812345678',
        role: 'user',
        addresses: [
          {
            name: 'Rahul Sharma',
            phone: '9812345678',
            street: 'Flat 402, Sunshine Apartments, HSR Layout',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560102',
            country: 'India',
            isDefault: true
          }
        ]
      });

      console.log('[Server] Initial data auto-seeded successfully!');
    }
  } catch (seedErr) {
    console.error('[Server] Auto-seed note:', seedErr.message);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    await autoSeedIfEmpty();

    const server = app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Elite Ecommerce API running on port ${PORT}`);
      console.log(`🌐 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`=================================================`);
    });

    // Handle unhandled rejections gracefully
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Promise Rejection:', err);
    });

    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
