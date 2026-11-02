const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');
const { uploadToCloudinary } = require('../utils/cloudinary');

// @desc    Get dashboard metrics and analytics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find({ paymentStatus: 'Paid' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    const lowStockProducts = await Product.find({ stock: { $lte: 10 } })
      .select('name stock price imageUrl')
      .limit(10);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        lowStockCount: lowStockProducts.length,
        ordersByStatus,
        recentOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed: ${allowed.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const wasCancelled = order.orderStatus === 'Cancelled';

    // Restore stock when cancelling an order (and it wasn't already cancelled)
    if (status === 'Cancelled' && !wasCancelled) {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    // If un-cancelling (restoring from Cancelled to another status), deduct stock again
    if (wasCancelled && status !== 'Cancelled') {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product && product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for '${product.name}' to restore this order. Only ${product.stock} units available.`
          });
        }
      }
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    order.orderStatus = status;
    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
      order.paymentStatus = 'Paid';
    }
    if (status === 'Cancelled') {
      order.paymentStatus = 'Refunded';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'`,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      discount,
      category,
      categoryName,
      brand,
      stock,
      features,
      isFeatured,
      isSuggested
    } = req.body;

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      const cloudinaryUrl = await uploadToCloudinary(req.file.path);
      imageUrl = cloudinaryUrl || `/uploads/${req.file.filename}`;
    }

    if (!name || !price || !category || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product name, price, category, and an image'
      });
    }

    const product = await Product.create({
      name,
      description: description || 'High quality product with best performance.',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      discount: discount || '10% OFF',
      category: category.toLowerCase(),
      categoryName: categoryName || category,
      brand: brand || 'Elite',
      imageUrl,
      stock: stock !== undefined ? Number(stock) : 50,
      features: features ? (Array.isArray(features) ? features : features.split(',').map(f => f.trim())) : undefined,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isSuggested: isSuggested === 'true' || isSuggested === true
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      discount,
      category,
      categoryName,
      brand,
      stock,
      features,
      isFeatured,
      isSuggested
    } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
    if (discount) product.discount = discount;
    if (category) product.category = category.toLowerCase();
    if (categoryName) product.categoryName = categoryName;
    if (brand) product.brand = brand;
    if (stock !== undefined) product.stock = Number(stock);
    if (features) {
      product.features = Array.isArray(features)
        ? features
        : features.split(',').map((f) => f.trim());
    }
    if (isFeatured !== undefined) {
      product.isFeatured = isFeatured === 'true' || isFeatured === true;
    }
    if (isSuggested !== undefined) {
      product.isSuggested = isSuggested === 'true' || isSuggested === true;
    }

    if (req.file) {
      const cloudinaryUrl = await uploadToCloudinary(req.file.path);
      product.imageUrl = cloudinaryUrl || `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      product.imageUrl = req.body.imageUrl;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory (stock) for a single product
// @route   PUT /api/admin/products/:id/inventory
// @access  Private/Admin
exports.updateInventory = async (req, res, next) => {
  try {
    const { stock, action } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (action === 'set' && stock !== undefined) {
      // Absolute set
      product.stock = Math.max(0, Number(stock));
    } else if (action === 'add' && stock !== undefined) {
      // Increment
      product.stock = Math.max(0, product.stock + Number(stock));
    } else if (action === 'subtract' && stock !== undefined) {
      // Decrement
      product.stock = Math.max(0, product.stock - Number(stock));
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide stock value and action (set, add, or subtract)'
      });
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: `Inventory updated for '${product.name}'. New stock: ${product.stock}`,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update inventory for multiple products
// @route   PUT /api/admin/inventory/bulk
// @access  Private/Admin
exports.bulkUpdateInventory = async (req, res, next) => {
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of updates: [{ productId, stock, action }]'
      });
    }

    const results = [];

    for (const update of updates) {
      const product = await Product.findById(update.productId);
      if (!product) {
        results.push({ productId: update.productId, success: false, message: 'Product not found' });
        continue;
      }

      const action = update.action || 'set';
      const stockVal = Number(update.stock);

      if (action === 'set') {
        product.stock = Math.max(0, stockVal);
      } else if (action === 'add') {
        product.stock = Math.max(0, product.stock + stockVal);
      } else if (action === 'subtract') {
        product.stock = Math.max(0, product.stock - stockVal);
      }

      await product.save();
      results.push({
        productId: update.productId,
        name: product.name,
        success: true,
        newStock: product.stock
      });
    }

    res.status(200).json({
      success: true,
      message: `${results.filter(r => r.success).length} of ${updates.length} products updated`,
      results
    });
  } catch (error) {
    next(error);
  }
};
