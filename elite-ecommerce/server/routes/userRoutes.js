const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress,
  toggleWishlist,
  getWishlist
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/address', addAddress);
router.delete('/address/:addressId', deleteAddress);
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', toggleWishlist);

module.exports = router;
