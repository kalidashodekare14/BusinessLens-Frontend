import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  accessToken: string | null;
  status: "unknown" | "authenticated" | "unauthenticated";
}

const TOKEN_KEY = "bl_access_token";

function loadTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  accessToken: loadTokenFromStorage(),
  status: loadTokenFromStorage() ? "authenticated" : "unknown",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action) {
      state.accessToken = action.payload;
      state.status = action.payload ? "authenticated" : "unauthenticated";
      if (typeof window !== "undefined") {
        try {
          if (action.payload) {
            sessionStorage.setItem(TOKEN_KEY, action.payload);
          } else {
            sessionStorage.removeItem(TOKEN_KEY);
          }
        } catch {}
      }
    },
    clearAuth(state) {
      state.accessToken = null;
      state.status = "unauthenticated";
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem(TOKEN_KEY);
        } catch {}
      }
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
  },
});

export const { setToken, clearAuth, setStatus } = authSlice.actions;
export const selectCurrentUser = (state: any) => state.auth?.user ?? null;
export default authSlice.reducer;