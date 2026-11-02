import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user, addAddress } = useAuth();
  const navigate = useNavigate();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    phone: user?.phone || ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddress(newAddress);
      setShowNewAddressForm(false);
      setNewAddress({ street: '', city: '', state: '', postalCode: '', phone: user?.phone || '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    let shippingAddress = null;

    if (user?.addresses && user.addresses.length > 0) {
      shippingAddress = user.addresses[selectedAddressIndex] || user.addresses[0];
    } else if (newAddress.street && newAddress.city && newAddress.postalCode) {
      shippingAddress = newAddress;
    }

    if (!shippingAddress) {
      setError('Please add and select a shipping address');
      setShowNewAddressForm(true);
      return;
    }

    setPlacingOrder(true);
    try {
      const orderPayload = {
        items: cart.items.map((i) => ({
          productId: i.productId || i._id,
          quantity: i.quantity,
          name: i.name,
          price: i.price,
          imageUrl: i.imageUrl
        })),
        shippingAddress: {
          name: shippingAddress.name || user.name,
          phone: shippingAddress.phone || user.phone || '9876543210',
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state || 'Karnataka',
          postalCode: shippingAddress.postalCode,
          country: 'India'
        },
        paymentMethod
      };

      const res = await api.post('/orders', orderPayload);
      if (res.data.success) {
        clearCart();
        navigate(`/order-success/${res.data.order._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        {/* Left Side: Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Step 1: Login Check */}
          <div className="section-card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ background: '#2874f0', color: 'white', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', fontWeight: 700 }}>
                1
              </span>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600 }}>LOGIN INFO</h3>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                  {user?.name} ({user?.email})
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Delivery Address */}
          <div className="section-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ background: '#2874f0', color: 'white', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', fontWeight: 700 }}>
                2
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>DELIVERY ADDRESS</h3>
            </div>

            {user?.addresses && user.addresses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {user.addresses.map((addr, idx) => (
                  <label
                    key={addr._id || idx}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px',
                      border: selectedAddressIndex === idx ? '2px solid #2874f0' : '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: selectedAddressIndex === idx ? '#f5f9ff' : 'white'
                    }}
                  >
                    <input
                      type="radio"
                      name="selectedAddress"
                      checked={selectedAddressIndex === idx}
                      onChange={() => setSelectedAddressIndex(idx)}
                    />
                    <div>
                      <strong style={{ fontSize: '14px' }}>{addr.name || user.name}</strong>{' '}
                      <span style={{ fontSize: '13px', color: '#666' }}>({addr.phone || user.phone})</span>
                      <p style={{ fontSize: '13px', color: '#444', marginTop: '4px' }}>
                        {addr.street}, {addr.city}, {addr.state} - <strong>{addr.postalCode}</strong>
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>
                No saved address found. Please add a shipping address below.
              </p>
            )}

            {!showNewAddressForm ? (
              <button
                type="button"
                onClick={() => setShowNewAddressForm(true)}
                style={{
                  marginTop: '14px',
                  background: 'none',
                  border: '1px dashed #2874f0',
                  color: '#2874f0',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                + Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddNewAddress} style={{ marginTop: '16px', background: '#fafafa', padding: '16px', borderRadius: '6px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Add Shipping Address</h4>
                <div className="form-group">
                  <label>House / Flat No, Building, Street</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Flat 301, Brigade Orchards"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Bengaluru"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Postal Code / Pincode</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 560103"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-primary-orange" style={{ width: 'auto', padding: '8px 20px' }}>
                    Save &amp; Use Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    style={{ background: 'none', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Step 3: Payment Options */}
          <div className="section-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ background: '#2874f0', color: 'white', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', fontWeight: 700 }}>
                3
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>PAYMENT OPTIONS</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: paymentMethod === 'COD' ? '2px solid #2874f0' : '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: paymentMethod === 'COD' ? '#f5f9ff' : 'white'
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <div>
                  <strong>Cash on Delivery (COD)</strong>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    Pay with cash or UPI upon delivery at your doorstep
                  </p>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: paymentMethod === 'Online' ? '2px solid #2874f0' : '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: paymentMethod === 'Online' ? '#f5f9ff' : 'white'
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Online"
                  checked={paymentMethod === 'Online'}
                  onChange={() => setPaymentMethod('Online')}
                />
                <div>
                  <strong>Online Payment (UPI, Credit/Debit Card, Netbanking)</strong>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    Safe &amp; Instant verification (Simulated Payment Gateway)
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="price-summary-card">
          <h3 className="price-summary-title">Order Summary</h3>

          <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '16px' }}>
            {cart.items.map((item) => (
              <div
                key={item.productId || item._id}
                style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '13px' }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </div>
                  <div style={{ color: '#666' }}>
                    Qty: {item.quantity} &times; ₹{item.price.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="price-row">
            <span>Items ({cart.itemCount})</span>
            <span>₹{cart.totalAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="price-row">
            <span>Delivery</span>
            <span style={{ color: '#388e3c', fontWeight: 600 }}>FREE</span>
          </div>

          <div className="price-row total-row">
            <span>Total Payable</span>
            <span>₹{cart.totalAmount.toLocaleString('en-IN')}</span>
          </div>

          {error && (
            <div style={{ color: '#e74c3c', fontSize: '13px', marginBottom: '12px' }}>
              <i className="fa-solid fa-circle-exclamation"></i> {error}
            </div>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="btn-place-order"
          >
            {placingOrder ? (
              <span><i className="fa-solid fa-spinner fa-spin"></i> Processing Order...</span>
            ) : (
              `CONFIRM & PAY ₹${cart.totalAmount.toLocaleString('en-IN')}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
