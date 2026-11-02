import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const categories = [
  { slug: '', label: 'For You', icon: 'fa-star' },
  { slug: 'fashion', label: 'Fashion', icon: 'fa-shirt' },
  { slug: 'mobiles', label: 'Mobiles', icon: 'fa-mobile-screen' },
  { slug: 'beauty', label: 'Beauty', icon: 'fa-spa' },
  { slug: 'electronics', label: 'Electronics', icon: 'fa-tv' },
  { slug: 'home', label: 'Home', icon: 'fa-house' },
  { slug: 'appliances', label: 'Appliances', icon: 'fa-blender' },
  { slug: 'toys', label: 'Toys', icon: 'fa-puzzle-piece' },
  { slug: 'food', label: 'Food', icon: 'fa-utensils' },
  { slug: 'auto', label: 'Auto', icon: 'fa-car' },
  { slug: 'sports', label: 'Sports', icon: 'fa-football' },
  { slug: 'books', label: 'Books', icon: 'fa-book' },
  { slug: 'furniture', label: 'Furniture', icon: 'fa-couch' },
];

const CategoryNav = () => {
  const location = useLocation();

  return (
    <nav className="category-nav-wrapper">
      <div className="container">
        <ul className="category-nav-list">
          {categories.map((cat) => {
            const path = cat.slug === '' ? '/' : `/category/${cat.slug}`;
            const isActive =
              cat.slug === ''
                ? location.pathname === '/'
                : location.pathname === `/category/${cat.slug}`;

            return (
              <li key={cat.label}>
                <NavLink
                  to={path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <i className={`fa-solid ${cat.icon}`}></i>
                  <p>{cat.label}</p>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default CategoryNav;
