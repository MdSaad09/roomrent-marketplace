import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './uiSlice';

const initialState = {
  users: [],
  dashboardStats: null,
  loading: false,
  error: null
};


// Create user
export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const { data } = await axios.post('/api/admin/users', userData, config);
      
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

// Get all users
export const getUsers = createAsyncThunk(
  'admin/getUsers',
  async (_, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const { data } = await axios.get('/api/admin/users', config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch users' });
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, userData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const { data } = await axios.put(`/api/admin/users/${id}`, userData, config);
      
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
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      await axios.delete(`/api/admin/users/${id}`, config);
      
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

// Get dashboard stats
export const getDashboardStats = createAsyncThunk(
  'admin/getDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const { data } = await axios.get('/api/admin/stats', config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch dashboard stats' });
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
    // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.unshift(action.payload.data); // Add to the beginning of the array
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get users
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
      })
      .addCase(getUsers.rejected, (state, action) => {
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
      
      // Get dashboard stats
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload.data;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;