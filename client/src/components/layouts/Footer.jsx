// client/src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import Logo from '../common/Logo';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <Logo light />
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted partner in finding the perfect property. We make real estate simple and accessible for everyone.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaInstagram />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaLinkedin />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/properties" className="text-gray-400 hover:text-white">Properties</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-white">Register</Link>
              </li>
            </ul>
          </div>
          
          {/* Property Types */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Property Types</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/properties?type=apartment" className="text-gray-400 hover:text-white">Apartments</Link>
              </li>
              <li>
                <Link to="/properties?type=house" className="text-gray-400 hover:text-white">Houses</Link>
              </li>
              <li>
                <Link to="/properties?type=condo" className="text-gray-400 hover:text-white">Condos</Link>
              </li>
              <li>
                <Link to="/properties?type=commercial" className="text-gray-400 hover:text-white">Commercial</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-2 text-gray-400" />
                <span className="text-gray-400">71 Adarsh Nagar, Jaipur, Raj, 302001</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-2 text-gray-400" />
                <span className="text-gray-400">(91) 7737439141</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-2 text-gray-400" />
                <span className="text-gray-400">info@roomrent.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} RoomRent. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;