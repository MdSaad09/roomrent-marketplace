import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, resetAuthState } from '../redux/slices/authSlice';
import { FaUserPlus, FaUser, FaEnvelope, FaLock, FaPhone, FaHome, FaBuilding } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bio: '',
    role: 'user'
  });
  
  const { name, email, password, confirmPassword, phone, bio, role } = formData;
  const [passwordError, setPasswordError] = useState('');
  const [step, setStep] = useState(1); // 1 for basics, 2 for role selection, 3 for role-specific fields
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, isAuthenticated, error, user } = useSelector(state => state.auth);
  
  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'agent') {
        navigate('/agent');
      } else {
        // Regular users should go to home or profile
        navigate('/');
      }
    }
    
    // Clear any auth errors when component unmounts
    return () => {
      dispatch(resetAuthState());
    };
  }, [isAuthenticated, navigate, dispatch, user]);
  
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear password error when user types in password fields
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
      setPasswordError('');
    }
  };
  
  const handleNextStep = () => {
    if (step === 1) {
      // Validate email and password
      if (!name || !email || !password || !confirmPassword) {
        return; // Don't proceed if required fields are missing
      }
      
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
      
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };
  
  const handlePrevStep = () => {
    setStep(step - 1);
  };
  
  const handleRoleSelect = selectedRole => {
    setFormData({ ...formData, role: selectedRole });
    setStep(3);
  };
  
  const handleSubmit = e => {
    e.preventDefault();
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Register user
    dispatch(register({ name, email, password, phone, bio, role }));
  };
  
  const renderStepOne = () => (
    <>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className="text-gray-400" />
          </div>
          <input
            id="name"
            type="text"
            name="name"
            value={name}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="John Doe"
            required
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaEnvelope className="text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="text-gray-400" />
          </div>
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
            required
            minLength="6"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              passwordError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="••••••••"
            required
          />
        </div>
        {passwordError && (
          <p className="text-red-500 text-xs mt-1">{passwordError}</p>
        )}
      </div>
      
      <button
        type="button"
        onClick={handleNextStep}
        className="w-full bg-primary text-gray-700 py-2 px-4 rounded-md hover:bg-indigo-700 hover:text-white transition duration-300 flex items-center justify-center"
      >
        Next
      </button>
    </>
  );
  
  const renderStepTwo = () => (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">I am registering as a:</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => handleRoleSelect('user')}
          className={`border rounded-lg p-4 cursor-pointer hover:border-indigo-600 hover:bg-indigo-50 transition-colors ${
            role === 'user' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
          }`}
        >
          <div className="flex items-center mb-2">
            <FaHome className="text-indigo-600 text-2xl mr-3" />
            <h4 className="text-lg font-medium">Buyer/Renter</h4>
          </div>
          <p className="text-gray-600 text-sm">
            I want to browse and purchase/rent properties. I'm looking for my next home or investment.
          </p>
        </div>
        
        <div 
          onClick={() => handleRoleSelect('agent')}
          className={`border rounded-lg p-4 cursor-pointer hover:border-indigo-600 hover:bg-indigo-50 transition-colors ${
            role === 'agent' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
          }`}
        >
          <div className="flex items-center mb-2">
            <FaBuilding className="text-indigo-600 text-2xl mr-3" />
            <h4 className="text-lg font-medium">Property Agent</h4>
          </div>
          <p className="text-gray-600 text-sm">
            I want to list and sell/rent out properties. I represent properties and help clients find their ideal home.
          </p>
        </div>
      </div>
      
      <div className="flex mt-6 justify-between">
        <button
          type="button"
          onClick={handlePrevStep}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-300"
        >
          Back
        </button>
      </div>
    </div>
  );
  
  const renderStepThree = () => (
    <>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">
          Phone Number {role === 'agent' && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaPhone className="text-gray-400" />
          </div>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={phone}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="(123) 456-7890"
            required={role === 'agent'}
          />
        </div>
      </div>
      
      {role === 'agent' && (
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="bio">
            Professional Bio <span className="text-red-500">*</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tell potential clients about yourself, your experience, and the areas you specialize in..."
            rows="4"
            required
          ></textarea>
        </div>
      )}
      
      <div className="flex justify-between mb-6">
        <button
          type="button"
          onClick={handlePrevStep}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-300"
        >
          Back
        </button>
        
        <button
          type="submit"
          className="bg-primary text-gray-700 py-2 px-4 rounded-md hover:bg-indigo-700 hover:text-white transition duration-300 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            <>
              <FaUserPlus className="mr-2" /> Create Account
            </>
          )}
        </button>
      </div>
    </>
  );
  
  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary py-4 px-6 text-white text-center">
            <h2 className="text-gray-700 text-2xl font-bold">Create an Account</h2>
            <p className="text-gray-700 text-sm mt-1">
              {step === 1 && "Step 1: Basic Information"}
              {step === 2 && "Step 2: Select Your Role"}
              {step === 3 && "Step 3: Additional Details"}
            </p>
          </div>
          
          <div className="p-6">
          {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error.message}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {step === 1 && renderStepOne()}
              {step === 2 && renderStepTwo()}
              {step === 3 && renderStepThree()}
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;