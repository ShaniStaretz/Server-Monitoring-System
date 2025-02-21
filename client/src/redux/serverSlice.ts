import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ServerType } from "../types/Server";

// Define the initial state type
interface ServerState {
  servers: ServerType[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ServerState = {
  servers: [],
  loading: false,
  error: null,
};

// Create Redux slice
const serverSlice = createSlice({
  name: "servers",
  initialState,
  reducers: {
    addServer: (state, action: PayloadAction<ServerType>) => {
      state.servers.push(action.payload);
    },
    updateServer: (state, action: PayloadAction<ServerType>) => {
      const index = state.servers.findIndex(
        (s: ServerType) => s.id === action.payload.id
      );
      if (index !== -1) state.servers[index] = action.payload;
    },
    deleteServer: (state, action: PayloadAction<number>) => {
      state.servers = state.servers.filter(
        (server: ServerType) => server.id !== action.payload
      );
    },
    setServers: (state, action: PayloadAction<ServerType[]>) => {
      state.servers = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Export actions
export const {
  addServer,
  updateServer,
  deleteServer,
  setServers,
  setLoading,
  setError,
} = serverSlice.actions;

// Export reducer
export default serverSlice.reducer;
