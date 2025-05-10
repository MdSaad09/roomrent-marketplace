import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './uiSlice';

const initialState = {
  agents: [],
  agent: null,
  agentDashboardStats: null,
  agentProperties: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0
  }
};

// Get all agents
export const fetchAgents = createAsyncThunk(
  'agents/fetchAgents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const { data } = await axios.get(`/api/agents?${queryParams}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch agents' });
    }
  }
);

// Get agent by ID
export const fetchAgentById = createAsyncThunk(
  'agents/fetchAgentById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/agents/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch agent' });
    }
  }
);

// Get agent properties
export const fetchAgentProperties = createAsyncThunk(
  'agents/fetchAgentProperties',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/properties/agent/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch agent properties' });
    }
  }
);

// NEW: Update agent profile
export const updateAgentProfile = createAsyncThunk(
  'agents/updateAgentProfile',
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put('/api/agents/profile', profileData);
      dispatch(setAlert({ type: 'success', message: 'Profile updated successfully' }));
      return data;
    } catch (error) {
      dispatch(setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to update profile' }));
      return rejectWithValue(error.response?.data || { message: 'Failed to update profile' });
    }
  }
);

// NEW: Get agent dashboard stats
export const fetchAgentDashboardStats = createAsyncThunk(
  'agents/fetchAgentDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/agents/dashboard/stats');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch dashboard stats' });
    }
  }
);

// NEW: Get agent's own properties
export const fetchAgentOwnProperties = createAsyncThunk(
  'agents/fetchAgentOwnProperties',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const { data } = await axios.get(`/api/agents/dashboard/properties?${queryParams}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch properties' });
    }
  }
);

const agentSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    clearAgentError: (state) => {
      state.error = null;
    },
    clearAgentData: (state) => {
      state.agent = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all agents
      .addCase(fetchAgents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.loading = false;
        
        if (Array.isArray(action.payload)) {
          state.agents = action.payload;
        } else if (action.payload && action.payload.data) {
          state.agents = action.payload.data;
          
          // Set pagination if it exists
          if (action.payload.pagination) {
            state.pagination = {
              currentPage: action.payload.pagination?.page || 1,
              totalPages: action.payload.pagination?.pages || 1,
              total: action.payload.total || 0
            };
          }
        } else {
          state.agents = [];
        }
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch agent by ID
      .addCase(fetchAgentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          state.agent = action.payload.data;
        } else {
          state.agent = action.payload;
        }
      })
      .addCase(fetchAgentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch agent properties
      .addCase(fetchAgentProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentProperties.fulfilled, (state, action) => {
        state.loading = false;
        if (state.agent) {
          state.agent.properties = action.payload.data;
        }
      })
      .addCase(fetchAgentProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // NEW: Update agent profile
      .addCase(updateAgentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAgentProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Update the agent data in the state
        if (action.payload && action.payload.data) {
          state.agent = action.payload.data;
        }
      })
      .addCase(updateAgentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // NEW: Fetch agent dashboard stats
      .addCase(fetchAgentDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          state.agentDashboardStats = action.payload.data;
        }
      })
      .addCase(fetchAgentDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // NEW: Fetch agent's own properties
      .addCase(fetchAgentOwnProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentOwnProperties.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          state.agentProperties = action.payload.data;
          
          // Set pagination if it exists
          if (action.payload.pagination) {
            state.pagination = {
              currentPage: action.payload.pagination?.page || 1,
              totalPages: action.payload.pagination?.pages || 1,
              total: action.payload.total || 0
            };
          }
        } else {
          state.agentProperties = [];
        }
      })
      .addCase(fetchAgentOwnProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }
});

export const { clearAgentError, clearAgentData } = agentSlice.actions;
export default agentSlice.reducer;