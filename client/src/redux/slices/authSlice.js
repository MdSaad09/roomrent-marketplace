import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './uiSlice';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user || null,
  isAuthenticated: !!user,
  loading: false,
  error: null
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const { data } = await axios.post('/api/auth/register', userData, config);
      
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      dispatch(setAlert({ type: 'success', message: 'Registration successful!' }));
      
      return data;
    } catch (error) {
      dispatch(setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Registration failed' 
      }));
      return rejectWithValue(error.response?.data || { message: 'Registration failed' });
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const { data } = await axios.post('/api/auth/login', userData, config);
      
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      dispatch(setAlert({ type: 'success', message: 'Login successful!' }));
      
      return data;
    } catch (error) {
      dispatch(setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Login failed' 
      }));
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await axios.get('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    dispatch(setAlert({ type: 'success', message: 'Logged out successfully' }));
  }
);

// Get user profile
export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };

      const { data } = await axios.get('/api/auth/me', config);
      
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to get user profile' });
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };

      const { data } = await axios.put('/api/users/profile', userData, config);
      
      dispatch(setAlert({ type: 'success', message: 'Profile updated successfully' }));
      
      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(data.data));
      
      return data;
    } catch (error) {
      dispatch(setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to update profile' 
      }));
      return rejectWithValue(error.response?.data || { message: 'Failed to update profile' });
    }
  }
);

// Get user favorites
export const getUserFavorites = createAsyncThunk(
  'auth/getUserFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const response = await axios.get('/api/users/favorites', config);
      console.log('Get favorites response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Get favorites error:', error);
      return rejectWithValue(error.response?.data || { 
        message: 'Failed to get favorites',
        error: error.message
      });
    }
  }
);

// Add to favorites
export const addToFavorites = createAsyncThunk(
  'auth/addToFavorites',
  async (propertyId, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const { data } = await axios.post(`/api/users/favorites/${propertyId}`, {}, config);
      console.log('Add to favorites response:', data);
      
      dispatch(setAlert({ 
        type: 'success', 
        message: 'Property added to favorites' 
      }));
      
      // Update user in localStorage
      if (data.data) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          user.favorites = data.data;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
      
      return data;
    } catch (error) {
      console.error('Add to favorites error:', error);
      dispatch(setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to add to favorites' 
      }));
      return rejectWithValue(error.response?.data || { message: 'Failed to add to favorites' });
    }
  }
);

// Remove from favorites
export const removeFromFavorites = createAsyncThunk(
  'auth/removeFromFavorites',
  async (propertyId, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const { data } = await axios.delete(`/api/users/favorites/${propertyId}`, config);
      console.log('Remove from favorites response:', data);
      
      dispatch(setAlert({ 
        type: 'success', 
        message: 'Property removed from favorites' 
      }));
      
      // Update user in localStorage
      if (data.data) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          user.favorites = data.data;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
      
      return data;
    } catch (error) {
      console.error('Remove from favorites error:', error);
      dispatch(setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to remove from favorites' 
      }));
      return rejectWithValue(error.response?.data || { message: 'Failed to remove from favorites' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.error = null;
      state.loading = false;
    },
    updateUserState: (state, action) => {
      if (action.payload) {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      
      // Get user profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Update profile response:', action.payload);
        
        if (action.payload.data) {
          state.user = action.payload.data;
        } else if (action.payload.user) {
          state.user = action.payload.user;
        } else if (action.payload) {
          state.user = action.payload;
        }
        
        console.log('Updated user state:', state.user);
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user favorites
      .addCase(getUserFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserFavorites.fulfilled, (state, action) => {
        state.loading = false;
        
        // Check the format of the response
        console.log('Get favorites fulfilled with payload:', action.payload);
        
        // Update user's favorites based on the response format
        if (state.user) {
          if (action.payload?.data) {
            state.user.favorites = action.payload.data;
          } else if (Array.isArray(action.payload)) {
            state.user.favorites = action.payload;
          }
          
          // Update localStorage
          const userData = JSON.parse(localStorage.getItem('user'));
          if (userData) {
            userData.favorites = state.user.favorites;
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      })
      .addCase(getUserFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Get favorites rejected with payload:', action.payload);
      })
      // Add to favorites
      .addCase(addToFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update user's favorites
        if (state.user && action.payload?.data) {
          state.user.favorites = action.payload.data;
        }
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove from favorites
      .addCase(removeFromFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update user's favorites
        if (state.user && action.payload?.data) {
          state.user.favorites = action.payload.data;
        }
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }
});

export const { resetAuthState, updateUserState } = authSlice.actions;
export default authSlice.reducer;