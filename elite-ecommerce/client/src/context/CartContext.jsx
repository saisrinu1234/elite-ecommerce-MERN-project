import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch cart whenever auth user changes
  useEffect(() => {
    if (user) {
      fetchServerCart();
    } else {
      loadGuestCart();
    }
  }, [user]);

  // Load from local cache for guest
  const loadGuestCart = () => {
    try {
      const saved = localStorage.getItem('cart-products');
      if (saved) {
        const items = JSON.parse(saved);
        const formatted = items.map((item, idx) => ({
          _id: item._id || `guest_${idx}`,
          productId: item._id || item.productId || `guest_p_${idx}`,
          name: item.name,
          price: item.price,
          discount: item.discount || '10% OFF',
          imageUrl: item.imageUrl,
          stock: item.stock || 50,
          quantity: item.quantity || 1,
          subtotal: (item.price || 0) * (item.quantity || 1)
        }));
        const total = formatted.reduce((acc, curr) => acc + curr.subtotal, 0);
        const count = formatted.reduce((acc, curr) => acc + curr.quantity, 0);
        setCart({ items: formatted, totalAmount: total, itemCount: count });
      } else {
        setCart({ items: [], totalAmount: 0, itemCount: 0 });
      }
    } catch (e) {
      setCart({ items: [], totalAmount: 0, itemCount: 0 });
    }
  };

  const fetchServerCart = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.warn('Failed to fetch server cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (user) {
      try {
        const res = await api.post('/cart', {
          productId: product._id,
          quantity
        });
        if (res.data.success) {
          setCart(res.data.cart);
          return { success: true, message: 'Added to cart' };
        }
      } catch (err) {
        return { success: false, message: err.message };
      }
    } else {
      // Guest cart support
      let items = [...cart.items];
      const index = items.findIndex(
        (i) => i.productId === product._id || i.name === product.name
      );

      if (index > -1) {
        items[index].quantity += quantity;
        items[index].subtotal = items[index].price * items[index].quantity;
      } else {
        items.push({
          _id: `guest_${Date.now()}`,
          productId: product._id,
          name: product.name,
          price: product.price,
          discount: product.discount,
          imageUrl: product.imageUrl,
          stock: product.stock || 50,
          quantity,
          subtotal: product.price * quantity
        });
      }

      const total = items.reduce((acc, curr) => acc + curr.subtotal, 0);
      const count = items.reduce((acc, curr) => acc + curr.quantity, 0);
      const newCart = { items, totalAmount: total, itemCount: count };
      setCart(newCart);
      localStorage.setItem('cart-products', JSON.stringify(items));
      return { success: true, message: 'Added to cart' };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    if (user) {
      try {
        const res = await api.put(`/cart/${productId}`, { quantity });
        if (res.data.success) {
          setCart(res.data.cart);
        }
      } catch (err) {
        console.error('Update quantity error:', err.message);
      }
    } else {
      const items = cart.items.map((item) => {
        if (item.productId === productId || item._id === productId) {
          const qty = Number(quantity);
          return { ...item, quantity: qty, subtotal: item.price * qty };
        }
        return item;
      });

      const total = items.reduce((acc, curr) => acc + curr.subtotal, 0);
      const count = items.reduce((acc, curr) => acc + curr.quantity, 0);
      const newCart = { items, totalAmount: total, itemCount: count };
      setCart(newCart);
      localStorage.setItem('cart-products', JSON.stringify(items));
    }
  };

  const removeFromCart = async (productId) => {
    if (user) {
      try {
        const res = await api.delete(`/cart/${productId}`);
        if (res.data.success) {
          setCart(res.data.cart);
        }
      } catch (err) {
        console.error('Remove from cart error:', err.message);
      }
    } else {
      const items = cart.items.filter(
        (item) => item.productId !== productId && item._id !== productId
      );
      const total = items.reduce((acc, curr) => acc + curr.subtotal, 0);
      const count = items.reduce((acc, curr) => acc + curr.quantity, 0);
      const newCart = { items, totalAmount: total, itemCount: count };
      setCart(newCart);
      localStorage.setItem('cart-products', JSON.stringify(items));
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.delete('/cart');
      } catch (e) {}
    }
    setCart({ items: [], totalAmount: 0, itemCount: 0 });
    localStorage.removeItem('cart-products');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchServerCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
