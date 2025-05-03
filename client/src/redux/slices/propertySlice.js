import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './uiSlice';

const initialState = {
  properties: [],
  property: null,
  featuredProperties: [],
  userProperties: [],
  pendingProperties: [], // Added for admin pending properties
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0
  },
  filters: {
    type: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    city: '',
    search: ''
  }
};

// Fetch all properties
export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async (params = {}, { rejectWithValue, getState, dispatch }) => {
    try {
      console.log('fetchProperties thunk executing with params:', params);
      
      const { filters, pagination } = getState().properties;
      const queryParams = {
        ...filters,
        ...params,
        page: params.page || pagination.currentPage
      };
      
      // Remove empty filters
      Object.keys(queryParams).forEach(key => 
        !queryParams[key] && delete queryParams[key]
      );
      
      // Build query string
      const queryString = new URLSearchParams(queryParams).toString();
      console.log('API request URL:', `/api/properties?${queryString}`);
      
      const response = await axios.get(`/api/properties?${queryString}`);
      console.log('API response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('API error in fetchProperties:', error.response || error);
      
      // Log a more user-friendly error message
      dispatch(setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to fetch properties'
      }));
      
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch properties' });
    }
  }
);

// Fetch single property
export const fetchPropertyById = createAsyncThunk(
  'properties/fetchPropertyById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/properties/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch property' });
    }
  }
);

// Create property
export const createProperty = createAsyncThunk(
  'properties/createProperty',
  async (propertyData, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const { data } = await axios.post('/api/properties', propertyData, config);
      
      dispatch(setAlert({ type: 'success', message: 'Property created successfully' }));
      
      return data;
    } catch (error) {
      dispatch(setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to create property' 
      }));
      return rejectWithValue(error.response?.data || { message: 'Failed to create property' });
    }
  }
);

// Update property
export const updateProperty = createAsyncThunk(
  'properties/updateProperty',
  async ({ id, propertyData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const { data } = await axios.put(`/api/properties/${id}`, propertyData, config);
      
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

// Delete property
export const deleteProperty = createAsyncThunk(
  'properties/deleteProperty',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      await axios.delete(`/api/properties/${id}`, config);
      
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

// Fetch featured properties
export const fetchFeaturedProperties = createAsyncThunk(
  'properties/fetchFeaturedProperties',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/properties/featured');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch featured properties' });
    }
  }
);

// Fetch user properties
export const fetchUserProperties = createAsyncThunk(
  'properties/fetchUserProperties',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching user properties...');
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      // Updated to match your backend route structure
      const { data } = await axios.get('/api/properties/user/properties', config);
      console.log('User properties response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user properties:', error.response || error);
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch user properties' });
    }
  }
);

// Get properties pending approval (Admin only)
export const getPendingProperties = createAsyncThunk(
  'properties/getPendingProperties',
  async (_, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const { data } = await axios.get('/api/properties/admin/pending', config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch pending properties' });
    }
  }
);

// Approve a property (Admin only)
export const approveProperty = createAsyncThunk(
  'properties/approveProperty',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const { data } = await axios.put(`/api/properties/${id}/approve`, {}, config);
      
      dispatch(setAlert({ type: 'success', message: 'Property approved successfully' }));
      
      return data;
    } catch (error) {
      dispatch(setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to approve property' 
      }));
      return rejectWithValue(error.response?.data || { message: 'Failed to approve property' });
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'properties/toggleFavorite',
  async (propertyId, { rejectWithValue, dispatch, getState }) => {
    try {
      // Get current user and favorites
      const { user } = getState().auth;
      
      if (!user) {
        throw new Error('You must be logged in to favorite properties');
      }
      
      // Get current favorites
      const favorites = user.favorites || [];
      
      // Check if property is already favorited
      const isFavorite = favorites.some(id => 
        id.toString() === propertyId.toString()
      );
      
      // Create updated favorites
      let updatedFavorites;
      if (isFavorite) {
        // Remove from favorites
        updatedFavorites = favorites.filter(id => 
          id.toString() !== propertyId.toString()
        );
      } else {
        // Add to favorites
        updatedFavorites = [...favorites, propertyId];
      }
      
      console.log('Toggling favorite:', {
        propertyId,
        currentFavorites: favorites,
        updatedFavorites,
        action: isFavorite ? 'remove' : 'add'
      });
      
      // Send update to server
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const { data } = await axios.put(
        '/api/users/profile',
        { favorites: updatedFavorites },
        config
      );
      
      console.log('Toggle favorite response:', data);
      
      // Update auth state
      dispatch(updateUserData(data));
      
      return {
        propertyId,
        isFavorite: !isFavorite
      };
    } catch (error) {
      console.error('Toggle favorite error:', error);
      return rejectWithValue(error.message || 'Failed to update favorites');
    }
  }
);

export const updateUserData = createAction('auth/updateUserData');

const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearPropertyError: (state) => {
      state.error = null;
    },
    clearCurrentProperty: (state) => {
      state.property = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch properties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // In propertySlice.js
      .addCase(fetchProperties.fulfilled, (state, action) => {
        console.log('fetchProperties.fulfilled with payload:', action.payload);
        state.loading = false;
        
        // Check what format the data is in
        if (Array.isArray(action.payload)) {
          // If the API directly returns an array of properties
          state.properties = action.payload;
        } else if (action.payload && action.payload.data) {
          // If the API returns an object with a data property containing properties
          state.properties = action.payload.data;
          
          // Set pagination if it exists
          if (action.payload.pagination) {
            state.pagination = {
              currentPage: action.payload.pagination?.next?.page - 1 || 
                          action.payload.pagination?.prev?.page + 1 || 1,
              totalPages: Math.ceil(action.payload.count / 
                          (action.payload.pagination?.next?.limit || 10)),
              total: action.payload.count
            };
          }
        } else {
          // Fallback - try to find properties in the response
          console.warn('Unexpected API response format:', action.payload);
          state.properties = action.payload || [];
        }
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch property by ID
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.property = action.payload.data;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create property
      .addCase(createProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.userProperties = [action.payload.data, ...state.userProperties];
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update property
      .addCase(updateProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.property = action.payload.data;
        state.userProperties = state.userProperties.map(property => 
          property._id === action.payload.data._id ? action.payload.data : property
        );
        state.properties = state.properties.map(property => 
          property._id === action.payload.data._id ? action.payload.data : property
        );
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete property
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.userProperties = state.userProperties.filter(
          property => property._id !== action.payload
        );
        state.properties = state.properties.filter(
          property => property._id !== action.payload
        );
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch featured properties
      .addCase(fetchFeaturedProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProperties = action.payload.data;
      })
      .addCase(fetchFeaturedProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch user properties
      .addCase(fetchUserProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.userProperties = action.payload.data;
      })
      .addCase(fetchUserProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get pending properties (Admin)
      .addCase(getPendingProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingProperties = action.payload.data;
      })
      .addCase(getPendingProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Approve property (Admin)
      .addCase(approveProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveProperty.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from pending properties if it exists
        if (state.pendingProperties) {
          state.pendingProperties = state.pendingProperties.filter(
            property => property._id !== action.payload.data._id
          );
        }
      })
      .addCase(approveProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update user data (for favorites)
      .addCase(toggleFavorite.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }
});

export const { 
  setFilters, 
  clearFilters, 
  clearPropertyError, 
  clearCurrentProperty 
} = propertySlice.actions;

export default propertySlice.reducer;