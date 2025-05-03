// client/src/pages/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <FaExclamationTriangle className="mx-auto text-yellow-500 text-5xl mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. This area is restricted to administrators only.
        </p>
        <div className="flex justify-center">
          <Link
            to="/"
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;