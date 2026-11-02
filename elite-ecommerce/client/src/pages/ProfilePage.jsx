import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateProfile, addAddress, deleteAddress } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // New address state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    phone: user?.phone || ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await updateProfile({ name, phone });
      setMsg('Profile updated successfully!');
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddress(newAddr);
      setShowAddressModal(false);
      setNewAddr({ street: '', city: '', state: '', postalCode: '', phone: user?.phone || '' });
    } catch (err) {
      alert(`Error adding address: ${err.message}`);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '850px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '20px 0' }}>
        My Profile &amp; Settings
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* Personal Details Card */}
        <div className="section-card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>
            Personal Information
          </h2>

          {msg && (
            <div
              style={{
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '13px',
                background: msg.startsWith('Error') ? '#ffebee' : '#e8f5e9',
                color: msg.startsWith('Error') ? '#c62828' : '#2e7d32'
              }}
            >
              {msg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address (read-only)</label>
                <input
                  type="email"
                  className="form-control"
                  value={user?.email || ''}
                  disabled
                  style={{ background: '#f5f5f5', color: '#888' }}
                />
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                />
              </div>

              <div className="form-group">
                <label>Account Role</label>
                <input
                  type="text"
                  className="form-control"
                  value={user?.role?.toUpperCase() || 'USER'}
                  disabled
                  style={{ background: '#f5f5f5', color: '#888' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary-orange"
              style={{ width: 'auto', padding: '10px 24px', marginTop: '10px' }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Addresses Book Card */}
        <div className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Manage Addresses</h2>
            <button
              onClick={() => setShowAddressModal(true)}
              style={{
                background: '#2874f0',
                color: 'white',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              + Add Address
            </button>
          </div>

          {user?.addresses && user.addresses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {user.addresses.map((addr) => (
                <div
                  key={addr._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #eee',
                    borderRadius: '6px',
                    padding: '14px',
                    background: '#fafafa'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '14px' }}>{addr.name || user.name}</strong>{' '}
                    <span style={{ fontSize: '13px', color: '#666' }}>({addr.phone || user.phone})</span>
                    <p style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
                      {addr.street}, {addr.city}, {addr.state} - <strong>{addr.postalCode}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => deleteAddress(addr._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e74c3c',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#888', fontSize: '13px' }}>
              No addresses saved yet. Add a default shipping address for quick checkout.
            </p>
          )}

          {showAddressModal && (
            <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
              <div className="auth-modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="auth-modal-header">
                  <h3>Add Shipping Address</h3>
                  <button className="modal-close-btn" onClick={() => setShowAddressModal(false)}>
                    &times;
                  </button>
                </div>
                <div className="auth-form-body">
                  <form onSubmit={handleAddAddress}>
                    <div className="form-group">
                      <label>Street Address</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newAddr.street}
                        onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal Code</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newAddr.postalCode}
                        onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="btn-primary-orange">
                      Save Address
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
