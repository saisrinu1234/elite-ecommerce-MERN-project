import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = ['Placed', 'Processing', 'Shipped', 'Delivered'];

  const getStatusIndex = (status) => {
    return statusSteps.indexOf(status);
  };

  const isCancelled = (order) => order.orderStatus === 'Cancelled';

  return (
    <div className="container" style={{ maxWidth: '960px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '20px 0', color: '#212121' }}>
        My Orders ({orders.length})
      </h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#2874f0' }}></i>
          <p style={{ marginTop: '12px', color: '#666' }}>Fetching your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <i className="fa-solid fa-box-open" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
          <h3>No Orders Yet</h3>
          <p style={{ color: '#888', margin: '10px 0 20px 0' }}>
            You haven't placed any orders with us yet.
          </p>
          <Link
            to="/"
            className="btn-primary-orange"
            style={{ width: 'auto', display: 'inline-block', padding: '10px 28px', textDecoration: 'none' }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => {
            const cancelled = isCancelled(order);
            const currentStepIdx = cancelled ? -1 : getStatusIndex(order.orderStatus);

            return (
              <div
                key={order._id}
                className="section-card"
                style={{
                  padding: '20px',
                  borderLeft: cancelled ? '4px solid #e53935' : undefined,
                  position: 'relative'
                }}
              >
                {/* Order Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: '#878787' }}>ORDER ID: </span>
                    <strong style={{ fontSize: '14px' }}>#{order._id}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: '#878787' }}>Placed on: </span>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '13px', color: '#878787' }}>Total: </span>
                      <strong style={{
                        fontSize: '15px',
                        color: cancelled ? '#999' : '#2874f0',
                        textDecoration: cancelled ? 'line-through' : 'none'
                      }}>
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    {cancelled && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: '#ffebee',
                        color: '#c62828',
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        border: '1px solid #ef9a9a',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}>
                        <i className="fa-solid fa-ban" style={{ fontSize: '11px' }}></i>
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Stepper — normal flow */}
                {!cancelled && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 10px', position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '20px',
                        right: '20px',
                        height: '3px',
                        background: '#eee',
                        zIndex: 1
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          background: '#388e3c',
                          width: `${Math.max(0, (currentStepIdx / (statusSteps.length - 1)) * 100)}%`,
                          transition: 'width 0.3s'
                        }}
                      ></div>
                    </div>

                    {statusSteps.map((step, idx) => {
                      const isPassed = idx <= currentStepIdx;
                      return (
                        <div
                          key={step}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            zIndex: 2
                          }}
                        >
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: isPassed ? '#388e3c' : '#ffffff',
                              border: isPassed ? '2px solid #388e3c' : '2px solid #ccc',
                              color: isPassed ? 'white' : '#ccc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}
                          >
                            {isPassed ? '✓' : idx + 1}
                          </div>
                          <span
                            style={{
                              fontSize: '12px',
                              marginTop: '6px',
                              color: isPassed ? '#212121' : '#aaa',
                              fontWeight: isPassed ? 600 : 400
                            }}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Status Stepper — cancelled */}
                {cancelled && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '16px 10px',
                    padding: '14px 20px',
                    background: '#ffebee',
                    borderRadius: '8px',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#e53935',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      ✕
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: '#c62828',
                      fontWeight: 600
                    }}>
                      This order has been cancelled
                    </span>
                  </div>
                )}

                {/* Ordered Items List */}
                <div style={{ marginTop: '20px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                  {order.orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '12px',
                        opacity: cancelled ? 0.6 : 1
                      }}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'contain',
                          border: '1px solid #eee',
                          borderRadius: '4px',
                          filter: cancelled ? 'grayscale(40%)' : 'none'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <Link
                          to={`/product/${item.product}`}
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: cancelled ? '#999' : '#212121',
                            textDecoration: 'none'
                          }}
                        >
                          {item.name}
                        </Link>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                          Qty: {item.quantity} &times; ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: cancelled ? '#999' : '#212121',
                        textDecoration: cancelled ? 'line-through' : 'none'
                      }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment summary footer */}
                <div style={{
                  background: cancelled ? '#fff5f5' : '#fafafa',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '10px'
                }}>
                  <span>Delivered to: <strong>{order.shippingAddress.name}</strong> ({order.shippingAddress.city}, {order.shippingAddress.postalCode})</span>
                  <span style={{ margin: '0 10px' }}>|</span>
                  <span>Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
