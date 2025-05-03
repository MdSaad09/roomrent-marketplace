// client/src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <FaExclamationTriangle className="mx-auto text-yellow-500 text-6xl" />
          <h1 className="mt-4 text-4xl font-bold text-gray-800">404</h1>
          <h2 className="mt-2 text-2xl font-semibold text-gray-600">Page Not Found</h2>
          <p className="mt-4 text-gray-500">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-indigo-700 w-full"
          >
            <FaHome className="mr-2" /> Go to Homepage
          </Link>
          
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;