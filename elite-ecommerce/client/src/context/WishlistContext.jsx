import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, openAuthModal } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/users/wishlist');
      if (res.data.success) {
        setWishlist(res.data.wishlist || []);
      }
    } catch (e) {
      console.warn('Wishlist load error:', e.message);
    }
  };

  const toggleWishlist = async (product) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    try {
      const res = await api.post(`/users/wishlist/${product._id}`);
      if (res.data.success) {
        if (res.data.isWishlisted) {
          setWishlist((prev) => [...prev, product]);
        } else {
          setWishlist((prev) =>
            prev.filter((p) => (p._id || p) !== product._id)
          );
        }
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err.message);
    }
  };

  const isWishlisted = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isWishlisted,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
