import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product, 1);
  };

  const imageSrc = product.imageUrl || '/images/iphone.jpg';

  return (
    <div className="product-card">
      {/* Wishlist button */}
      <button
        className={`wishlist-icon-btn ${isWishlisted(product._id) ? 'active' : ''}`}
        onClick={handleWishlistClick}
        title={isWishlisted(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <i className={isWishlisted(product._id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
      </button>

      <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="product-card-img-wrapper">
          <img
            src={imageSrc}
            alt={product.name}
            className="product-card-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/iphone.jpg';
            }}
          />
        </div>

        <h3 className="product-card-title" title={product.name}>
          {product.name}
        </h3>

        {product.rating && (
          <div className="product-card-rating">
            <span>{product.rating}</span>
            <i className="fa-solid fa-star" style={{ fontSize: '9px' }}></i>
          </div>
        )}

        <div className="product-card-prices">
          <span className="product-card-price">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="product-card-original">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
          <span className="product-card-discount">{product.discount || '10% OFF'}</span>
        </div>
      </Link>

      <button
        onClick={handleQuickAdd}
        style={{
          marginTop: '10px',
          background: '#ff9f00',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        <i className="fa-solid fa-cart-plus" style={{ marginRight: '5px' }}></i> Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
