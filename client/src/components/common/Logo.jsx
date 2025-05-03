// client/src/components/common/Logo.jsx
import React from 'react';
import { FaHome } from 'react-icons/fa';

const Logo = ({ light }) => {
  return (
    <div className="flex items-center">
      <FaHome className={`text-2xl mr-2 ${light ? 'text-white' : 'text-primary'}`} />
      <span className={`font-bold text-xl ${light ? 'text-white' : 'text-gray-800'}`}>
        roomRent
      </span>
    </div>
  );
};

export default Logo;