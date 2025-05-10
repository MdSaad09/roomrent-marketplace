// src/redux/slices/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './uiSlice';

// Initial state
const initialState = {
  users: [],
  user: null,
  agents: [],
  pendingProperties: [],
  agentStats: [],
  dashboardStats: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0
  }
};

// Get dashboard stats
export const fetchAdminDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch dashboard stats' });
    }
  }
);

// Get all users
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const { data } = await axios.get(`/api/admin/users?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch users' });
    }
  }
);

// Get user by ID
export const fetchUserById = createAsyncThunk(
  'admin/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch user' });
    }
  }
);

// Create new user
export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post('/api/admin/users', userData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      dispatch(setAlert({ type: 'success', message: 'User created successfully' }));
      return data;
    } catch (error) {
      dispatch(setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to create user' 
      }));
      return rejectWithValue(error.response?.data || { message: 'Failed to create user' });
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, userData }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put(`/api/admin/users/${id}`, userData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      dispatch(setAlert({ type: 'success', message: 'User updated successfully' }));
      return data;
    } catch (error) {
      dispatch(setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to update user' 
      }));
      return rejectWithValue(error.response?.data || { message: 'Failed to update user' });
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`/api/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      dispatch(setAlert({ type: 'success', message: 'User deleted successfully' }));
      return id;
    } catch (error) {
      dispatch(setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to delete user' 
      }));
      return rejectWithValue(error.response?.data || { message: 'Failed to delete user' });
    }
  }
);

// Get all agents (admin specific function)
export const fetchAllAgents = createAsyncThunk(
  'admin/fetchAllAgents',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/admin/agents', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch agents' });
    }
  }
);

// Update agent status (activate/deactivate)
export const updateAgentStatus = createAsyncThunk(
  'admin/updateAgentStatus',
  async ({ id, active }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put(`/api/admin/agents/${id}/status`, { active }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      dispatch(setAlert({ 
        type: 'success', 
        message: `Agent ${active ? 'activated' : 'deactivated'} successfully` 
      }));
      return data;
    } catch (error) {
      dispatch(setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to update agent status' 
      }));
      return rejectWithValue(error.response?.data || { message: 'Failed to update agent status' });
    }
  }
);

// Get pending properties
export const fetchPendingProperties = createAsyncThunk(
  'admin/fetchPendingProperties',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/admin/properties/pending', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch pending properties' });
    }
  }
);

// Approve/reject property
export const managePropertyApproval = createAsyncThunk(
  'admin/managePropertyApproval',
  async ({ id, approved, rejectionReason }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put(`/api/admin/properties/${id}/approval`, 
        { approved, rejectionReason }, 
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      dispatch(setAlert({ 
        type: 'success', 
        message: `Property ${approved ? 'approved' : 'rejected'} successfully` 
      }));
      return data;
    } catch (error) {
      dispatch(setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to update property approval' 
      }));
      return rejectWithValue(error.response?.data || { message: 'Failed to update property approval' });
    }
  }
);

// Get agent property stats
export const fetchAgentPropertyStats = createAsyncThunk(
  'admin/fetchAgentPropertyStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/admin/agent-stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch agent stats' });
    }
  }
);

// Update property (admin version with more permissions)
export const adminUpdateProperty = createAsyncThunk(
  'admin/updateProperty',
  async ({ id, propertyData }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put(`/api/admin/properties/${id}`, propertyData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      dispatch(setAlert({ type: 'success', message: 'Property updated successfully' }));
      return data;
    } catch (error) {
      dispatch(setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to update property' 
      }));
      return rejectWithValue(error.response?.data || { message: 'Failed to update property' });
    }
  }
);

// Delete property (admin version)
export const adminDeleteProperty = createAsyncThunk(
  'admin/deleteProperty',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`/api/admin/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      dispatch(setAlert({ type: 'success', message: 'Property deleted successfully' }));
      return id;
    } catch (error) {
      dispatch(setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to delete property' 
      }));
      return rejectWithValue(error.response?.data || { message: 'Failed to delete property' });
    }
  }
);

// The adminSlice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearAdminData: (state) => {
      state.user = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard stats
      .addCase(fetchAdminDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload.data;
      })
      .addCase(fetchAdminDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // All users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        // Set pagination if it exists
        if (action.payload.count) {
          state.pagination = {
            total: action.payload.count,
            // Other pagination values if available
          };
        }
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // User by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.unshift(action.payload.data);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.users = state.users.map(user => 
          user._id === action.payload.data._id ? action.payload.data : user
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // All agents
      .addCase(fetchAllAgents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAgents.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = action.payload.data;
      })
      .addCase(fetchAllAgents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update agent status
      .addCase(updateAgentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAgentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = state.agents.map(agent => 
          agent._id === action.payload.data._id ? { ...agent, ...action.payload.data } : agent
        );
      })
      .addCase(updateAgentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Pending properties
      .addCase(fetchPendingProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingProperties = action.payload.data;
      })
      .addCase(fetchPendingProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Manage property approval
      .addCase(managePropertyApproval.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(managePropertyApproval.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProperty = action.payload.data;
        // Remove from pending properties if approved
        if (updatedProperty.approved) {
          state.pendingProperties = state.pendingProperties.filter(
            property => property._id !== updatedProperty._id
          );
        } else {
          // Update the property in pending list
          state.pendingProperties = state.pendingProperties.map(property => 
            property._id === updatedProperty._id ? updatedProperty : property
          );
        }
      })
      .addCase(managePropertyApproval.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Agent property stats
      .addCase(fetchAgentPropertyStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentPropertyStats.fulfilled, (state, action) => {
        state.loading = false;
        state.agentStats = action.payload.data;
      })
      .addCase(fetchAgentPropertyStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Admin update property
      .addCase(adminUpdateProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminUpdateProperty.fulfilled, (state, action) => {
        state.loading = false;
        // Update in pending properties if exists
        if (state.pendingProperties.length > 0) {
          state.pendingProperties = state.pendingProperties.map(property => 
            property._id === action.payload.data._id ? action.payload.data : property
          );
        }
      })
      .addCase(adminUpdateProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Admin delete property
      .addCase(adminDeleteProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminDeleteProperty.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from pending properties if exists
        if (state.pendingProperties.length > 0) {
          state.pendingProperties = state.pendingProperties.filter(
            property => property._id !== action.payload
          );
        }
      })
      .addCase(adminDeleteProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }
});

export const { clearAdminError, clearAdminData } = adminSlice.actions;
export default adminSlice.reducer;