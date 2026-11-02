import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const WishlistPage = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
        <div className="section-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <i className="fa-solid fa-heart-crack" style={{ fontSize: '48px', color: '#ffcdd2', marginBottom: '16px' }}></i>
          <h2>Your Wishlist is Empty</h2>
          <p style={{ color: '#888', margin: '10px 0 24px 0' }}>
            Tap the heart icon on any product to save it here for later.
          </p>
          <Link
            to="/"
            className="btn-primary-orange"
            style={{ width: 'auto', display: 'inline-block', padding: '10px 28px', textDecoration: 'none' }}
          >
            Explore Deals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '20px 0' }}>
        My Wishlist ({wishlist.length} items)
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {wishlist.map((item) => (
          <div key={item._id} className="product-card">
            <button
              className="wishlist-icon-btn active"
              onClick={() => toggleWishlist(item)}
              title="Remove from Wishlist"
            >
              <i className="fa-solid fa-trash-can" style={{ fontSize: '13px', color: '#e74c3c' }}></i>
            </button>

            <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="product-card-img-wrapper">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="product-card-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/iphone.jpg';
                  }}
                />
              </div>

              <h3 className="product-card-title">{item.name}</h3>

              <div className="product-card-prices">
                <span className="product-card-price">₹{item.price?.toLocaleString('en-IN')}</span>
                <span className="product-card-discount">{item.discount || '15% OFF'}</span>
              </div>
            </Link>

            <button
              onClick={() => addToCart(item, 1)}
              className="btn-primary-orange"
              style={{ marginTop: '12px', fontSize: '13px', height: '36px' }}
            >
              Move to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
