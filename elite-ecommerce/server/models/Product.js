const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: 'High quality product with best performance. Trusted by thousands of users.'
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be positive']
    },
    originalPrice: {
      type: Number,
      default: function () {
        return this.price;
      }
    },
    discount: {
      type: String,
      default: '10% OFF'
    },
    category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    categoryName: {
      type: String,
      default: 'General'
    },
    brand: {
      type: String,
      default: 'Elite'
    },
    imageUrl: {
      type: String,
      required: [true, 'Main product image URL is required']
    },
    images: {
      type: [String],
      default: []
    },
    stock: {
      type: Number,
      default: 50,
      min: [0, 'Stock cannot be negative']
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    },
    features: {
      type: [String],
      default: [
        '1 Year Warranty',
        'Free Delivery',
        '7 Days Replacement Policy',
        '100% Genuine Product'
      ]
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isSuggested: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

productSchema.index({ name: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
