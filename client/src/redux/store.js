import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import uiReducer from './slices/uiSlice';
import adminReducer from './slices/adminSlice';
import agentReducer from './slices/agentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertyReducer,
    ui: uiReducer,
    admin: adminReducer,
    agents: agentReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});