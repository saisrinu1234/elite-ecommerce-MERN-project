const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllUsers,
  updateInventory,
  bulkUpdateInventory
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/products', upload.single('image'), createProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);
router.put('/products/:id/inventory', updateInventory);
router.put('/inventory/bulk', bulkUpdateInventory);
router.get('/users', getAllUsers);

module.exports = router;

