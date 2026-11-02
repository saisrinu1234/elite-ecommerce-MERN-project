import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { user, logout, openAuthModal } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('Location Not Set');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempLocation, setTempLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (tempLocation.trim()) {
      setLocation(tempLocation.trim());
      setShowLocationModal(false);
    }
  };

  return (
    <header className="site-header">
      {/* Top Notification / Location bar */}
      <div className="container">
        <div className="header-top">
          <div className="header-top-left">
            <span
              className="location-badge"
              onClick={() => setShowLocationModal(true)}
              title="Click to change location"
            >
              <i className="fa-solid fa-location-dot"></i>
              <span>{location}</span>
              <span className="blue-text">Select your Location &gt;</span>
            </span>
          </div>
          <div className="header-top-right">
            <span>24x7 Customer Care</span>
            <span>Download App</span>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="header-main">
          {/* Logo */}
          <Link to="/" className="logo-link">
            <img src="/images/elitestore.jpeg" alt="Elite Ecommerce" className="logo-img" />
            <span className="brand-text">Elite <span className="brand-sub">Plus</span></span>
          </Link>

          {/* Search Bar */}
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search for Products, Brands and More"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="search-btn" title="Search">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </form>

          {/* User & Actions */}
          <div className="header-actions">
            {user ? (
              <div className="dropdown-container">
                <button className="header-btn btn-login-outline">
                  <i className="fa-solid fa-circle-user"></i>
                  <span>{user.name.split(' ')[0]}</span>
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: '10px' }}></i>
                </button>
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    <i className="fa-solid fa-user"></i> My Profile
                  </Link>
                  <Link to="/orders" className="dropdown-item">
                    <i className="fa-solid fa-box"></i> Orders
                  </Link>
                  <Link to="/wishlist" className="dropdown-item">
                    <i className="fa-solid fa-heart"></i> Wishlist
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item" style={{ color: '#2874f0', fontWeight: 'bold' }}>
                      <i className="fa-solid fa-chart-line"></i> Admin Portal
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <div
                    className="dropdown-item"
                    onClick={() => logout()}
                    style={{ color: '#e74c3c' }}
                  >
                    <i className="fa-solid fa-right-from-bracket"></i> Logout
                  </div>
                </div>
              </div>
            ) : (
              <button
                className="header-btn btn-login-outline"
                onClick={() => openAuthModal('login')}
              >
                <i className="fa-solid fa-user"></i>
                <span>Login</span>
              </button>
            )}

            {/* More Dropdown */}
            <div className="dropdown-container">
              <span className="dropdown-trigger">
                More <i className="fa-solid fa-chevron-down" style={{ fontSize: '10px' }}></i>
              </span>
              <div className="dropdown-menu">
                <div className="dropdown-item">
                  <i className="fa-solid fa-bell"></i> Notifications
                </div>
                <div className="dropdown-item">
                  <i className="fa-solid fa-headset"></i> Customer Care
                </div>
                <div className="dropdown-item">
                  <i className="fa-solid fa-rectangle-ad"></i> Advertise
                </div>
                <div className="dropdown-item">
                  <i className="fa-solid fa-mobile-screen-button"></i> Download App
                </div>
              </div>
            </div>

            {/* Cart Button */}
            <Link to="/cart" className="header-btn cart-btn-header">
              <i className="fa-solid fa-cart-shopping"></i>
              <span>Cart</span>
              {cart.itemCount > 0 && (
                <span className="cart-badge">{cart.itemCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="auth-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h3>Choose your delivery location</h3>
              <p>Select delivery address or enter pincode</p>
              <button
                className="modal-close-btn"
                onClick={() => setShowLocationModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="auth-form-body">
              <form onSubmit={handleSaveLocation}>
                <div className="form-group">
                  <label>City or Pincode</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bengaluru, 560103"
                    value={tempLocation}
                    onChange={(e) => setTempLocation(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary-orange">
                  Apply Location
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
