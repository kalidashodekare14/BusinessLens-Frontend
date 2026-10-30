import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  accessToken: string | null;
  status: "unknown" | "authenticated" | "unauthenticated";
}

const initialState: AuthState = {
  accessToken: null,
  status: "unknown",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action) {
      state.accessToken = action.payload;
      state.status = action.payload ? "authenticated" : "unauthenticated";
    },
    clearAuth(state) {
      state.accessToken = null;
      state.status = "unauthenticated";
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
  },
});

export const { setToken, clearAuth, setStatus } = authSlice.actions;
export const selectCurrentUser = (state: any) => state.auth?.user ?? null;
export default authSlice.reducer;