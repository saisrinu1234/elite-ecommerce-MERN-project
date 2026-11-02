import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = () => {
  const { authModalOpen, authModalTab, closeAuthModal, login, register } = useAuth();

  const [tab, setTab] = useState(authModalTab || 'login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync tab if parent changes it
  React.useEffect(() => {
    setTab(authModalTab);
    setError('');
  }, [authModalTab]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(identifier, password);
      } else {
        await register(name, identifier, password, phone);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setTab('login');
      setIdentifier('admin@elite.com');
      setPassword('Admin@12345');
    } else {
      setTab('login');
      setIdentifier('customer@elite.com');
      setPassword('Customer@12345');
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="auth-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h3>{tab === 'login' ? 'Login' : 'Looks like you\'re new here!'}</h3>
          <p>
            {tab === 'login'
              ? 'Get access to your Orders, Wishlist and Recommendations'
              : 'Sign up with your details to get started'}
          </p>
          <button className="modal-close-btn" onClick={closeAuthModal}>
            &times;
          </button>
        </div>

        <div className="auth-form-body">
          {error && (
            <div
              style={{
                backgroundColor: '#ffebee',
                color: '#c62828',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '13px'
              }}
            >
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {tab === 'register' && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number (Optional)</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>{tab === 'login' ? 'Email or Mobile Number' : 'Email Address'}</label>
              <input
                type="text"
                className="form-control"
                placeholder={tab === 'login' ? 'Enter Email/Mobile' : 'name@example.com'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary-orange" disabled={loading}>
              {loading ? (
                <span><i className="fa-solid fa-spinner fa-spin"></i> Processing...</span>
              ) : tab === 'login' ? (
                'Login'
              ) : (
                'Continue'
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div style={{ marginTop: '16px', padding: '10px', background: '#f8f9fa', borderRadius: '4px', fontSize: '12px' }}>
            <span style={{ fontWeight: 600, color: '#555' }}>Quick Demo Fill:</span>{' '}
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              style={{ background: 'none', border: 'none', color: '#2874f0', cursor: 'pointer', fontWeight: 600, marginRight: '8px' }}
            >
              Admin
            </button>
            |
            <button
              type="button"
              onClick={() => fillDemo('customer')}
              style={{ background: 'none', border: 'none', color: '#2874f0', cursor: 'pointer', fontWeight: 600, marginLeft: '8px' }}
            >
              Customer
            </button>
          </div>

          <div className="auth-toggle-link">
            {tab === 'login' ? (
              <p>
                New to Elite Ecommerce?{' '}
                <span onClick={() => { setTab('register'); setError(''); }}>
                  Create an account
                </span>
              </p>
            ) : (
              <p>
                Existing User?{' '}
                <span onClick={() => { setTab('login'); setError(''); }}>
                  Log in
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
