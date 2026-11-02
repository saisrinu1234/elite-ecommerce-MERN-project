import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview | products | orders | users
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product Add / Edit modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'fashion',
    price: '',
    originalPrice: '',
    discount: '15% OFF',
    stock: 50,
    imageUrl: '',
    description: '',
    brand: 'Elite'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [adminNotice, setAdminNotice] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, orderRes, usersRes, catRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/products?limit=100'),
        api.get('/admin/orders'),
        api.get('/admin/users'),
        api.get('/categories')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (orderRes.data.success) setOrders(orderRes.data.orders);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (catRes.data.success) setCategories(catRes.data.categories);
    } catch (err) {
      console.error('Failed to load admin data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: categories[0]?.slug || 'fashion',
      price: '',
      originalPrice: '',
      discount: '15% OFF',
      stock: 50,
      imageUrl: '/images/iphone.jpg',
      description: 'High quality genuine product with official manufacturer warranty.',
      brand: 'Elite'
    });
    setSelectedFile(null);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price,
      discount: prod.discount || '15% OFF',
      stock: prod.stock,
      imageUrl: prod.imageUrl,
      description: prod.description || '',
      brand: prod.brand || 'Elite'
    });
    setSelectedFile(null);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setAdminNotice('');

    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('category', productForm.category);
      formData.append('price', productForm.price);
      formData.append('originalPrice', productForm.originalPrice || productForm.price);
      formData.append('discount', productForm.discount);
      formData.append('stock', productForm.stock);
      formData.append('description', productForm.description);
      formData.append('brand', productForm.brand);

      if (selectedFile) {
        formData.append('image', selectedFile);
      } else if (productForm.imageUrl) {
        formData.append('imageUrl', productForm.imageUrl);
      }

      if (editingProduct) {
        const res = await api.put(`/admin/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          setProducts((prev) =>
            prev.map((p) => (p._id === editingProduct._id ? res.data.product : p))
          );
          setAdminNotice(`Product '${res.data.product.name}' updated successfully.`);
        }
      } else {
        const res = await api.post('/admin/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          setProducts((prev) => [res.data.product, ...prev]);
          setAdminNotice(`Product '${res.data.product.name}' created successfully.`);
        }
      }

      setShowProductModal(false);
      // Refresh stats
      const statsRes = await api.get('/admin/stats');
      if (statsRes.data.success) setStats(statsRes.data.stats);
    } catch (err) {
      setAdminNotice(`Error: ${err.message}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}'?`)) return;

    try {
      const res = await api.delete(`/admin/products/${id}`);
      if (res.data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        setAdminNotice(`Product '${name}' deleted.`);
      }
    } catch (err) {
      alert(`Error deleting product: ${err.message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        setAdminNotice(`Order #${orderId} status set to '${newStatus}'.`);
      }
    } catch (err) {
      alert(`Error updating order status: ${err.message}`);
    }
  };

  return (
    <div className="container">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#2874f0' }}>
              <i className="fa-solid fa-gauge-high" style={{ marginRight: '10px' }}></i>
              Elite Ecommerce Admin Dashboard
            </h1>
            <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
              Real-time Database-backed Administration &amp; Inventory Management
            </p>
          </div>

          <button
            onClick={handleOpenAddProduct}
            className="btn-primary-orange"
            style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <i className="fa-solid fa-plus"></i> Add New Product
          </button>
        </div>

        {/* Global Action Banner */}
        {adminNotice && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px',
              background: adminNotice.startsWith('Error') ? '#ffebee' : '#e8f5e9',
              color: adminNotice.startsWith('Error') ? '#c62828' : '#2e7d32',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>{adminNotice}</span>
            <button
              onClick={() => setAdminNotice('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              &times;
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fa-solid fa-chart-pie" style={{ marginRight: '6px' }}></i>
            Overview &amp; Stats
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <i className="fa-solid fa-box" style={{ marginRight: '6px' }}></i>
            Products ({products.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="fa-solid fa-truck-fast" style={{ marginRight: '6px' }}></i>
            Orders ({orders.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="fa-solid fa-users" style={{ marginRight: '6px' }}></i>
            Registered Users ({users.length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#2874f0' }}></i>
            <p style={{ marginTop: '12px', color: '#666' }}>Loading administrative data...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW & STATS */}
            {activeTab === 'overview' && stats && (
              <div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-card-title">Total Revenue</span>
                    <div className="stat-card-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
                    <span style={{ fontSize: '12px', color: '#388e3c', marginTop: '6px', display: 'block' }}>
                      <i className="fa-solid fa-arrow-trend-up"></i> Based on settled orders
                    </span>
                  </div>

                  <div className="stat-card">
                    <span className="stat-card-title">Total Orders</span>
                    <div className="stat-card-value">{stats.totalOrders}</div>
                    <span style={{ fontSize: '12px', color: '#2874f0', marginTop: '6px', display: 'block' }}>
                      Across all categories
                    </span>
                  </div>

                  <div className="stat-card">
                    <span className="stat-card-title">Catalog Products</span>
                    <div className="stat-card-value">{stats.totalProducts}</div>
                    <span style={{ fontSize: '12px', color: '#555', marginTop: '6px', display: 'block' }}>
                      In 13 active categories
                    </span>
                  </div>

                  <div className="stat-card">
                    <span className="stat-card-title">Registered Users</span>
                    <div className="stat-card-value">{stats.totalUsers}</div>
                    <span style={{ fontSize: '12px', color: '#555', marginTop: '6px', display: 'block' }}>
                      Verified accounts
                    </span>
                  </div>
                </div>

                {/* Low Stock Alerts */}
                {stats.lowStockProducts && stats.lowStockProducts.length > 0 && (
                  <div style={{ marginBottom: '28px', border: '1px solid #ffe0b2', background: '#fff8e1', padding: '16px', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e65100', marginBottom: '10px' }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i>
                      Low Stock Inventory Alerts ({stats.lowStockProducts.length} items with &le; 10 units)
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                      {stats.lowStockProducts.map((p) => (
                        <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ffd54f' }}>
                          <img src={p.imageUrl} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{p.name}</div>
                            <span style={{ fontSize: '12px', color: '#c62828', fontWeight: 700 }}>Only {p.stock} left</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Orders Overview */}
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                  Recent Orders
                </h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o._id}>
                        <td><strong>#{o._id.slice(-6)}</strong></td>
                        <td>{o.user?.name || 'Customer'}</td>
                        <td>{o.orderItems.length} items</td>
                        <td><strong>₹{o.totalAmount.toLocaleString('en-IN')}</strong></td>
                        <td>
                          <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, background: o.orderStatus === 'Delivered' ? '#e8f5e9' : '#fff3e0', color: o.orderStatus === 'Delivered' ? '#2e7d32' : '#e65100' }}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: PRODUCTS MANAGEMENT */}
            {activeTab === 'products' && (
              <div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={p.imageUrl}
                            alt=""
                            style={{ width: '40px', height: '40px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '4px' }}
                            onError={(e) => { e.target.src = '/images/iphone.jpg'; }}
                          />
                          <div>
                            <strong>{p.name}</strong>
                            <div style={{ fontSize: '12px', color: '#888' }}>{p.brand}</div>
                          </div>
                        </td>
                        <td>
                          <span style={{ textTransform: 'capitalize' }}>{p.category}</span>
                        </td>
                        <td><strong>₹{p.price.toLocaleString('en-IN')}</strong></td>
                        <td>
                          <span style={{ fontWeight: 600, color: p.stock <= 10 ? '#e74c3c' : '#2e7d32' }}>
                            {p.stock}
                          </span>
                        </td>
                        <td>⭐ {p.rating}</td>
                        <td>
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            style={{ background: 'none', border: 'none', color: '#2874f0', cursor: 'pointer', marginRight: '12px', fontWeight: 600 }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id, p.name)}
                            style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: ORDERS MANAGEMENT */}
            {activeTab === 'orders' && (
              <div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer &amp; Phone</th>
                      <th>Delivery City</th>
                      <th>Items Count</th>
                      <th>Total Amount</th>
                      <th>Payment</th>
                      <th>Status Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id}>
                        <td><strong>#{o._id.slice(-6)}</strong></td>
                        <td>
                          <div>{o.shippingAddress?.name || o.user?.name}</div>
                          <div style={{ fontSize: '12px', color: '#888' }}>{o.shippingAddress?.phone}</div>
                        </td>
                        <td>{o.shippingAddress?.city}, {o.shippingAddress?.postalCode}</td>
                        <td>{o.orderItems.length} items</td>
                        <td><strong>₹{o.totalAmount.toLocaleString('en-IN')}</strong></td>
                        <td>
                          <span style={{ fontSize: '12px', color: o.paymentStatus === 'Paid' ? '#2e7d32' : '#e65100', fontWeight: 600 }}>
                            {o.paymentMethod} ({o.paymentStatus})
                          </span>
                        </td>
                        <td>
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                          >
                            <option value="Placed">Placed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 4: USERS MANAGEMENT */}
            {activeTab === 'users' && (
              <div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Email Address</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.phone || 'N/A'}</td>
                        <td>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: u.role === 'admin' ? '#e3f2fd' : '#f5f5f5',
                              color: u.role === 'admin' ? '#1976d2' : '#616161'
                            }}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Product Add / Edit Modal */}
        {showProductModal && (
          <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
            <div className="auth-modal-box" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
              <div className="auth-modal-header">
                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <p>Manage product catalog details and inventory</p>
                <button className="modal-close-btn" onClick={() => setShowProductModal(false)}>
                  &times;
                </button>
              </div>

              <div className="auth-form-body">
                <form onSubmit={handleSaveProduct}>
                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        className="form-control"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      >
                        {categories.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Brand</label>
                      <input
                        type="text"
                        className="form-control"
                        value={productForm.brand}
                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label>Price (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Original MRP (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Stock Qty</label>
                      <input
                        type="number"
                        className="form-control"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Upload Image File (Optional, or enter URL below)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      style={{ fontSize: '13px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Or Image Path / URL</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. /fashion/kurthi.webp or https://..."
                      value={productForm.imageUrl}
                      onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Product Description</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      style={{ height: 'auto' }}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button type="submit" className="btn-primary-orange" disabled={formSubmitting}>
                      {formSubmitting ? 'Saving...' : editingProduct ? 'Save Updates' : 'Create Product'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      style={{ background: 'none', border: '1px solid #ccc', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
