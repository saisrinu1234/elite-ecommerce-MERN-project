import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [fashionDeals, setFashionDeals] = useState([]);
  const [mobileDeals, setMobileDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [suggestedRes, fashionRes, mobileRes] = await Promise.all([
        api.get('/products/featured'),
        api.get('/products?category=fashion&limit=5'),
        api.get('/products?category=mobiles&limit=5')
      ]);

      if (suggestedRes.data.success) {
        setSuggestedProducts(suggestedRes.data.products);
      }
      if (fashionRes.data.success) {
        setFashionDeals(fashionRes.data.products);
      }
      if (mobileRes.data.success) {
        setMobileDeals(mobileRes.data.products);
      }
    } catch (err) {
      console.error('Failed to load homepage data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLookItems = [
    { name: 'iPhone', image: '/images/iphone.jpg', link: '/category/mobiles' },
    { name: 'Sandles', image: '/images/slipper.jpg', link: '/category/fashion' },
    { name: 'Shirts', image: '/images/shirts.jpg', link: '/category/fashion' },
    { name: 'Airpods', image: '/images/airpods.jpg', link: '/category/electronics' },
    { name: 'Watches', image: '/images/w1.jpg', link: '/category/electronics' }
  ];

  return (
    <div className="container">
      {/* Promotional Banners */}
      <div className="banner-grid">
        <div className="banner-item">
          <img src="/images/c1.jpg" alt="Special Sale Offer 1" />
        </div>
        <div className="banner-item">
          <img src="/images/c2.jpg" alt="Special Sale Offer 2" />
        </div>
      </div>

      {/* "Are you Still Looking for these?" Strip */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Are you Still Looking for these?</h2>
          <span style={{ fontSize: '13px', color: '#2874f0', cursor: 'pointer', fontWeight: 600 }}>
            VIEW ALL &gt;
          </span>
        </div>
        <div className="quick-strip">
          {quickLookItems.map((item, idx) => (
            <Link to={item.link} key={idx} className="quick-item-card">
              <img src={item.image} alt={item.name} />
              <p>{item.name}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* "Suggested for You" Section */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Suggested for You</h2>
          <span style={{ fontSize: '13px', color: '#878787' }}>Based on your interests</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#2874f0' }}></i>
            <p style={{ marginTop: '10px', color: '#666' }}>Loading suggestions...</p>
          </div>
        ) : (
          <div className="product-grid">
            {suggestedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Featured Mobiles Row */}
      {mobileDeals.length > 0 && (
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Best on Mobiles &amp; Gadgets</h2>
            <Link to="/category/mobiles" style={{ textDecoration: 'none', color: '#2874f0', fontWeight: 600, fontSize: '13px' }}>
              SEE ALL MOBILES &gt;
            </Link>
          </div>
          <div className="product-grid">
            {mobileDeals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Featured Fashion Row */}
      {fashionDeals.length > 0 && (
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Trending in Fashion</h2>
            <Link to="/category/fashion" style={{ textDecoration: 'none', color: '#2874f0', fontWeight: 600, fontSize: '13px' }}>
              SEE ALL FASHION &gt;
            </Link>
          </div>
          <div className="product-grid">
            {fashionDeals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
