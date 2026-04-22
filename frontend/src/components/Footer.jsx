import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-section">
          <h3>About HafiHub</h3>
          <p>
            HafiHub is a local economic activity marketplace for Rwanda. We connect 
            entrepreneurs, workers, and consumers to build a thriving local economy. 
            Our mission is to empower individuals and businesses to grow together.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/search">Search</Link>
            </li>
            <li>
              <Link to="/events">Events</Link>
            </li>
            <li>
              <Link to="/news">News</Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div className="footer-section">
          <h3>Categories</h3>
          <ul className="footer-links">
            <li>
              <a href="/?category=job">Jobs</a>
            </li>
            <li>
              <a href="/?category=quick_job">Quick Jobs</a>
            </li>
            <li>
              <a href="/?category=service">Services</a>
            </li>
            <li>
              <a href="/?category=product">Products</a>
            </li>
            <li>
              <a href="/?category=business">Business</a>
            </li>
          </ul>
        </div>

        {/* Hub Information */}
        <div className="footer-section">
          <h3>Hub Information</h3>
          <ul className="footer-info">
            <li>
              <strong>📍 Location:</strong> Rwanda
            </li>
            <li>
              <strong>🌍 Region:</strong> East Africa
            </li>
            <li>
              <strong>👥 Community:</strong> Growing marketplace
            </li>
            <li>
              <strong>💼 Focus:</strong> Local Economy
            </li>
            <li>
              <strong>🎯 Mission:</strong> Empower & Connect
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {currentYear} HafiHub. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <span className="separator">•</span>
            <a href="#terms">Terms of Service</a>
            <span className="separator">•</span>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
        <div className="footer-branding">
          <p>Building Rwanda's Local Economy 🚀</p>
        </div>
      </div>
    </footer>
  );
}
