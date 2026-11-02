const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = 'COD' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }

    // Server-side validation of products, current prices, and stock
    const validatedOrderItems = [];
    let itemsPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name || item.productId} no longer exists.`
        });
      }

      const qty = Number(item.quantity) || 1;
      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Only ${product.stock} units available.`
        });
      }

      // Snapshot authoritative database price
      const price = product.price;
      itemsPrice += price * qty;

      validatedOrderItems.push({
        product: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        price,
        quantity: qty
      });

      // Atomically decrement stock
      product.stock -= qty;
      await product.save();
    }

    // Shipping is free as per Elite Ecommerce banner ("Free Delivery")
    const shippingPrice = 0;
    const totalAmount = itemsPrice + shippingPrice;

    const order = await Order.create({
      user: req.user._id,
      orderItems: validatedOrderItems,
      shippingAddress: {
        name: shippingAddress.name || req.user.name,
        phone: shippingAddress.phone || req.user.phone,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state || '',
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'India'
      },
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      itemsPrice,
      shippingPrice,
      totalAmount,
      orderStatus: 'Placed'
    });

    // Clear user cart upon successful order creation
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Ensure order belongs to user or user is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment signature / update status
// @route   POST /api/orders/verify-payment
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = 'Paid';
    order.paymentResult = {
      paymentId: paymentId || `pay_${Date.now()}`,
      orderId: orderId,
      signature: signature || 'verified'
    };

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};
