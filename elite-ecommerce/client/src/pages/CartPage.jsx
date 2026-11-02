import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    navigate('/checkout');
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container">
        <div className="section-card empty-cart" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <img
            src="/images/elitestore.jpeg"
            alt="Empty Cart"
            style={{ width: '120px', opacity: 0.6, marginBottom: '20px' }}
          />
          <h2 style={{ fontSize: '22px', color: '#212121', marginBottom: '8px' }}>
            Your Cart is empty!
          </h2>
          <p style={{ color: '#878787', marginBottom: '24px' }}>
            Explore our categories and discover amazing deals today.
          </p>
          <Link
            to="/"
            className="btn-primary-orange"
            style={{ display: 'inline-block', width: 'auto', padding: '12px 32px', textDecoration: 'none' }}
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  // Calculate pricing breakdown
  const totalOriginalPrice = cart.items.reduce(
    (sum, item) => sum + (item.price * 1.25) * item.quantity,
    0
  );
  const discountAmount = Math.round(totalOriginalPrice - cart.totalAmount);

  return (
    <div className="container">
      <div className="cart-layout">
        {/* Left: Cart Items List */}
        <div className="cart-items-container">
          <div className="cart-header-strip">
            <span>My Cart ({cart.itemCount} items)</span>
            <button
              onClick={clearCart}
              style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
            >
              Clear Cart
            </button>
          </div>

          {cart.items.map((item) => {
            const itemKey = item.productId || item._id;
            return (
              <div key={itemKey} className="cart-product-row">
                <Link to={`/product/${item.productId}`}>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="cart-item-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/iphone.jpg';
                    }}
                  />
                </Link>

                <div className="cart-item-details">
                  <Link to={`/product/${item.productId}`} className="cart-item-title">
                    {item.name}
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '6px 0' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#212121' }}>
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                    <span style={{ color: '#388e3c', fontWeight: 600, fontSize: '13px' }}>
                      {item.discount || '15% OFF'}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                    Subtotal: <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                  </p>

                  <div className="cart-item-actions">
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.stock && item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Price Details Sidebar */}
        <div className="price-summary-card">
          <h3 className="price-summary-title">Price Details</h3>

          <div className="price-row">
            <span>Price ({cart.itemCount} items)</span>
            <span>₹{Math.round(totalOriginalPrice).toLocaleString('en-IN')}</span>
          </div>

          <div className="price-row">
            <span>Discount</span>
            <span style={{ color: '#388e3c' }}>- ₹{discountAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="price-row">
            <span>Delivery Charges</span>
            <span style={{ color: '#388e3c', fontWeight: 600 }}>FREE</span>
          </div>

          <div className="price-row total-row">
            <span>Total Amount</span>
            <span>₹{cart.totalAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="savings-badge">
            <i className="fa-solid fa-gift" style={{ marginRight: '6px' }}></i>
            You will save ₹{discountAmount.toLocaleString('en-IN')} on this order!
          </div>

          <button onClick={handleCheckout} className="btn-place-order">
            PLACE ORDER
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
