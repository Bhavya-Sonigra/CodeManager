import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            Code Manager
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Problems</Link>
            <Link to="/add" className="nav-link">Add Problem</Link>
          </div>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p>© 2024 Code Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
