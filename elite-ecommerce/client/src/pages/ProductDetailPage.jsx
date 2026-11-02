import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, openAuthModal } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // Review submission state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    fetchProductDetails();
    fetchReviews();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.product);
        setRelatedProducts(res.data.relatedProducts || []);
      }
    } catch (err) {
      console.error('Failed to load product details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${id}`);
      if (res.data.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.warn('Reviews fetch error:', err.message);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      await addToCart(product, 1);
      // Optional notification or redirect
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await addToCart(product, 1);
    navigate('/checkout');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!comment.trim()) return;

    setReviewSubmitting(true);
    setReviewMessage('');

    try {
      const res = await api.post('/reviews', {
        productId: product._id,
        rating: Number(rating),
        comment: comment.trim()
      });

      if (res.data.success) {
        setComment('');
        setReviewMessage('Your review has been submitted successfully!');
        fetchReviews();
        // Update product rating locally
        setProduct((prev) => ({
          ...prev,
          rating: res.data.review.rating
        }));
      }
    } catch (err) {
      setReviewMessage(`Error: ${err.message}`);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '36px', color: '#2874f0' }}></i>
        <p style={{ marginTop: '16px', color: '#666' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Product not found</h2>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '20px',
            background: '#2874f0',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Product Detail Layout */}
      <div className="product-detail-layout">
        {/* LEFT COLUMN: Main Image and Flipkart-Style CTAs */}
        <div className="product-detail-media">
          <div className="product-detail-main-img-box">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-detail-main-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/iphone.jpg';
              }}
            />
          </div>

          <div className="product-action-buttons">
            <button className="cart-btn" onClick={handleAddToCart} disabled={addingToCart}>
              <i className="fa-solid fa-cart-shopping"></i>
              {addingToCart ? 'ADDING...' : 'ADD TO CART'}
            </button>
            <button className="buy-btn" onClick={handleBuyNow}>
              <i className="fa-solid fa-bolt"></i>
              BUY NOW
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Details, Pricing, Features, and Highlights */}
        <div className="product-detail-info">
          <h1>{product.name}</h1>

          {/* Rating Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div className="product-card-rating" style={{ fontSize: '13px', padding: '4px 8px' }}>
              <span>{product.rating || 4.5}</span>
              <i className="fa-solid fa-star" style={{ fontSize: '10px' }}></i>
            </div>
            <span style={{ fontSize: '13px', color: '#878787' }}>
              {reviews.length || product.numReviews || 12} Ratings &amp; Reviews
            </span>
            <span style={{ fontSize: '13px', color: '#388e3c', fontWeight: 600 }}>
              ✔ Verified Assured
            </span>
          </div>

          {/* Special Price Badge */}
          <div style={{ fontSize: '13px', color: '#388e3c', fontWeight: 600 }}>
            Special Price
          </div>

          {/* Pricing */}
          <div className="product-detail-price-box">
            <span className="product-detail-price">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span style={{ color: '#878787', textDecoration: 'line-through', fontSize: '16px' }}>
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            <span style={{ color: '#388e3c', fontWeight: 700, fontSize: '16px' }}>
              {product.discount || '10% OFF'}
            </span>
          </div>

          {/* Description */}
          <p style={{ color: '#555', lineHeight: 1.6, margin: '16px 0', fontSize: '15px' }}>
            {product.description ||
              'High quality product with best performance. Trusted by thousands of users across India.'}
          </p>

          {/* Highlights & Features Checklist (preserves original HTML/CSS checklist) */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#212121', marginBottom: '10px' }}>
              Key Features &amp; Guarantees:
            </h3>
            <ul className="product-detail-features">
              {product.features && product.features.length > 0 ? (
                product.features.map((feat, idx) => (
                  <li key={idx}>
                    <i className="fa-solid fa-circle-check"></i>
                    <span>{feat}</span>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <i className="fa-solid fa-circle-check"></i>
                    <span>✔ 1 Year Domestic Brand Warranty</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-circle-check"></i>
                    <span>✔ Free Express Delivery</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-circle-check"></i>
                    <span>✔ 7 Days Replacement Policy</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-circle-check"></i>
                    <span>✔ Cash on Delivery Available</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Stock Availability */}
          <div style={{ marginTop: '16px', fontSize: '14px' }}>
            {product.stock > 0 ? (
              <span style={{ color: '#388e3c', fontWeight: 600 }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i>
                In Stock ({product.stock} units available)
              </span>
            ) : (
              <span style={{ color: '#e74c3c', fontWeight: 600 }}>
                <i className="fa-solid fa-circle-xmark" style={{ marginRight: '6px' }}></i>
                Currently Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Ratings &amp; Reviews</h2>
          <span style={{ fontSize: '14px', color: '#878787' }}>
            Overall Rating: {product.rating} / 5
          </span>
        </div>

        {/* Review Form */}
        <div style={{ background: '#fbfcfd', border: '1px solid #eef2f6', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '12px', fontSize: '15px' }}>Rate this Product</h4>
          {reviewMessage && (
            <p style={{ color: reviewMessage.startsWith('Error') ? '#c62828' : '#2e7d32', marginBottom: '12px', fontSize: '13px' }}>
              {reviewMessage}
            </p>
          )}
          <form onSubmit={handleSubmitReview}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Stars:</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                <option value="3">⭐⭐⭐ (3 - Good)</option>
                <option value="2">⭐⭐ (2 - Fair)</option>
                <option value="1">⭐ (1 - Poor)</option>
              </select>
            </div>
            <textarea
              placeholder="Write your honest review and experience with this product..."
              rows="3"
              className="form-control"
              style={{ height: 'auto', padding: '10px', marginBottom: '12px' }}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
            <button
              type="submit"
              className="btn-primary-orange"
              style={{ width: 'auto', padding: '8px 24px' }}
              disabled={reviewSubmitting}
            >
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map((rev) => (
              <div key={rev._id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="product-card-rating">
                    {rev.rating} <i className="fa-solid fa-star" style={{ fontSize: '9px' }}></i>
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{rev.user?.name || 'Verified Buyer'}</span>
                  <span style={{ fontSize: '12px', color: '#999', marginLeft: 'auto' }}>
                    {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <p style={{ color: '#444', fontSize: '14px', lineHeight: 1.5 }}>{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* "More Products" Grid (matching original LoadMoreProducts in overalljs.js) */}
      {relatedProducts.length > 0 && (
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">More Products You Might Like</h2>
            <span style={{ fontSize: '13px', color: '#2874f0', fontWeight: 600, cursor: 'pointer' }}>
              SIMILAR ITEMS
            </span>
          </div>
          <div className="product-grid">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct._id} product={relProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
