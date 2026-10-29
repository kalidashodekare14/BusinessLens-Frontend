import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./base-api";
import authReducer from "./auth-slice";
import orgReducer from "./org-slice";

/**
 * Redux store.
 * NOTE (F1.1): this minimal version is enough for F0 to build. It is expanded
 * with the full baseQuery, refresh single-flight and typed hooks in F1.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    org: orgReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [baseApi.util.resetApiState.type],
      },
    }).concat(baseApi.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;