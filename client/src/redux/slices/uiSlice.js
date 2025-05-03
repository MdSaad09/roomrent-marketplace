import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  alert: null,
  sidebarOpen: false,
  theme: localStorage.getItem('theme') || 'light'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setAlert: (state, action) => {
      state.alert = action.payload;
    },
    clearAlert: (state) => {
      state.alert = null;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    }
  }
});

export const { 
  setAlert, 
  clearAlert, 
  toggleSidebar, 
  setSidebarOpen,
  setTheme
} = uiSlice.actions;

export default uiSlice.reducer;