import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.warn('Failed to load order:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '750px', margin: '40px auto' }}>
      <div className="section-card" style={{ textAlign: 'center', padding: '40px 30px' }}>
        <div
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: '#e8f5e9',
            color: '#388e3c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            margin: '0 auto 20px auto'
          }}
        >
          <i className="fa-solid fa-check"></i>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#212121', marginBottom: '8px' }}>
          Order Placed Successfully!
        </h1>
        <p style={{ color: '#666', fontSize: '15px', marginBottom: '24px' }}>
          Thank you for shopping with Elite Ecommerce. We're processing your order right away.
        </p>

        {loading ? (
          <p>Loading order details...</p>
        ) : order ? (
          <div style={{ textAlign: 'left', background: '#fafafa', border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '12px' }}>
              <span>Order ID: <strong>#{order._id}</strong></span>
              <span style={{ color: '#388e3c', fontWeight: 600 }}>Status: {order.orderStatus}</span>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '6px' }}>Delivering to:</h4>
              <p style={{ fontSize: '13px', color: '#555' }}>
                {order.shippingAddress.name} ({order.shippingAddress.phone})<br />
                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Items ({order.orderItems.length}):</h4>
              {order.orderItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span>{item.name} &times; {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '10px', fontWeight: 700 }}>
              <span>Total Paid ({order.paymentMethod}):</span>
              <span style={{ color: '#2874f0' }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Link
            to="/orders"
            className="btn-primary-orange"
            style={{ width: 'auto', padding: '12px 28px', textDecoration: 'none' }}
          >
            View My Orders
          </Link>
          <Link
            to="/"
            style={{
              padding: '12px 28px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              textDecoration: 'none',
              color: '#333',
              fontWeight: 600
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
