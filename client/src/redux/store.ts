import { configureStore } from "@reduxjs/toolkit";
import serverReducer from "./serverSlice";

export const store = configureStore({
  reducer: {
    servers: serverReducer,
  },
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
