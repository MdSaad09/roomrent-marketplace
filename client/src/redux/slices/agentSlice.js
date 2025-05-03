import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './uiSlice';

const initialState = {
  agents: [],
  agent: null,
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
              total: action.payload.count || 0
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
  }
});

export const { clearAgentError, clearAgentData } = agentSlice.actions;
export default agentSlice.reducer;