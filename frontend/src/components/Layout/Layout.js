import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Emit search event for parent components
    const searchEvent = new CustomEvent('problemSearch', { 
      detail: { query: e.target.value } 
    });
    window.dispatchEvent(searchEvent);
  };

  return (
    <div className="layout">
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            Code Manager
          </Link>
          
          <div className="nav-search">
            <input
              type="search"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="nav-controls">
            <div className="nav-links">
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                <span className="nav-link-text">Problems</span>
              </Link>
              <Link to="/add" className={`nav-link ${isActive('/add') ? 'active' : ''}`}>
                <span className="nav-link-text">Add Problem</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
