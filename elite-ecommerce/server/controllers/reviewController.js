const Review = require('../models/Review');
const Product = require('../models/Product');

// Helper to recalculate product rating
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const rating =
    numReviews > 0
      ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews
      : 4.5;

  await Product.findByIdAndUpdate(productId, {
    rating: parseFloat(rating.toFixed(1)),
    numReviews
  });
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update a product review
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productId, rating, and comment'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let review = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (review) {
      review.rating = Number(rating);
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({
        user: req.user._id,
        product: productId,
        rating: Number(rating),
        comment
      });
    }

    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      message: 'Review saved successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};
