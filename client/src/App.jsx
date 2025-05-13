import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Redux
import { getUserProfile } from './redux/slices/authSlice';
import { clearAlert } from './redux/slices/uiSlice';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';
import AgentLayout from './components/layouts/AgentLayout';

// Pages
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';

// Public Agent Pages (for viewing agents)
import Agents from './pages/admin/Agents';
import AgentProfile from './pages/admin/AgentProfile';

// Agent Pages (for agent dashboard)
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentAddProperty from './pages/agent/AddProperty';
import AgentEditProperty from './pages/agent/EditProperty';
import AgentProperties from './pages/agent/MyProperties';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageProperties from './pages/admin/ManageProperties';
import AddProperty from './pages/admin/AddProperty';
import EditProperty from './pages/admin/EditProperty';
import MyProperties from './pages/admin/MyProperties';
import PendingProperties from './pages/admin/PendingProperties';
import Inquiries from './pages/admin/Inquiries';
import MyInquiries from './pages/dashboard/MyInquiries';

// Routes
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import AgentRoute from './components/routing/AgentRoute';

// Set axios defaults
import axios from 'axios';
axios.defaults.baseURL ='';

const App = () => {
  const dispatch = useDispatch();
  const { alert } = useSelector(state => state.ui);
  
  useEffect(() => {
    // Check if user is logged in
    if (localStorage.getItem('token')) {
      dispatch(getUserProfile());
    }
  }, [dispatch]);
  
  useEffect(() => {
    // Show alerts
    if (alert) {
      toast[alert.type](alert.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      
      dispatch(clearAlert());
    }
  }, [alert, dispatch]);
  
  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetails />} />
          
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="unauthorized" element={<Unauthorized />} />
          
          {/* Protected user routes within main layout */}
          <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
        </Route>

        {/* Agent Routes */}
        <Route path="/agent" element={<AgentRoute><AgentLayout /></AgentRoute>}>
          <Route index element={<AgentDashboard />} />
          <Route path="properties" element={<AgentProperties />} />
          <Route path="properties/add" element={<AgentAddProperty />} />
          <Route path="properties/edit/:id" element={<AgentEditProperty />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="properties" element={<ManageProperties />} />
          <Route path="properties/pending" element={<PendingProperties />} />
          <Route path="properties/my" element={<MyProperties />} />
          <Route path="properties/add" element={<AddProperty />} />
          <Route path="properties/edit/:id" element={<EditProperty />} />
          <Route path="agents" element={<Agents />} />
          <Route path="agents/:id" element={<AgentProfile />} />
          <Route path="inquiries" element={<Inquiries />} /> {/* Add this new route */}
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
{/* Add this new route */}
<Route path="/dashboard/inquiries" element={<PrivateRoute><MyInquiries /></PrivateRoute>} />