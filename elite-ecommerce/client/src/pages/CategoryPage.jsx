import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const title = searchQuery
    ? `Search Results for "${searchQuery}"`
    : categorySlug
    ? `${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} Products`
    : 'All Products';

  useEffect(() => {
    fetchCategoryProducts();
  }, [categorySlug, searchQuery, sort]);

  const fetchCategoryProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categorySlug) params.append('category', categorySlug);
      if (searchQuery) params.append('search', searchQuery);
      if (sort) params.append('sort', sort);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const res = await api.get(`/products?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.products);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load category products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchCategoryProducts();
  };

  const handleResetFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    setSort('');
  };

  return (
    <div className="container">
      {/* Fashion category specific top banner from original fashion.html */}
      {categorySlug === 'fashion' && (
        <div className="banner-grid">
          <div className="banner-item">
            <img src="/images/c1.jpg" alt="Fashion Banner 1" />
          </div>
          <div className="banner-item">
            <img src="/images/c2.jpg" alt="Fashion Banner 2" />
          </div>
        </div>
      )}

      {/* Main Category Header and Filter Bar */}
      <div className="section-card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#212121' }}>{title}</h1>
            <p style={{ fontSize: '13px', color: '#878787', marginTop: '4px' }}>
              Showing {products.length} of {totalCount} items
            </p>
          </div>

          {/* Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#555' }}>Sort By:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '13px',
                outline: 'none',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Featured / Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Price Range Filter Form */}
        <form
          onSubmit={handleApplyFilter}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #f0f0f0',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>Price Range:</span>
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={{ width: '90px', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{ width: '90px', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
          />
          <button
            type="submit"
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
            Apply
          </button>
          {(minPrice || maxPrice || sort) && (
            <button
              type="button"
              onClick={handleResetFilter}
              style={{
                background: 'none',
                border: '1px solid #ccc',
                color: '#666',
                padding: '5px 12px',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          )}
        </form>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#2874f0' }}></i>
          <p style={{ marginTop: '12px', color: '#666' }}>Fetching products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <i className="fa-solid fa-box-open" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
          <h3>No products found</h3>
          <p style={{ color: '#888', marginTop: '8px' }}>
            Try clearing filters or search for another term.
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
