import {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import type { ApiError, ApiEnvelope } from "@/types/api";
import { RootState } from "./store";
import { clearAuth, setToken } from "./auth-slice";

export type { ApiError };

function normalizeError(error: unknown): ApiError {
  if (typeof error === "object" && error !== null) {
    const err = error as any;
    // RTK Query fetch error
    if ("status" in err) {
      const status = typeof err.status === "number" ? err.status : 500;
      if (typeof err.data === "object" && err.data !== null) {
        const data = err.data as any;
        // Try common shapes: { error: {...} }, { message: ... }, envelope with error
        if (data.error && typeof data.error === "object") {
          return {
            status,
            code: data.error.code || data.error.error || "ERROR",
            message: data.error.message || data.message || "An error occurred",
            details: data.error.details || data.details,
          };
        }
        if (data.code || data.message) {
          return {
            status,
            code: data.code || "ERROR",
            message: data.message || "An error occurred",
            details: data.details,
          };
        }
      }
      if (typeof err.data === "string") {
        return { status, code: "ERROR", message: err.data };
      }
      return { status, code: "ERROR", message: err.error || "An error occurred" };
    }
  }
  return { status: 0, code: "NETWORK_ERROR", message: "Network error" };
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

let refreshPromise: Promise<string | null> | null = null;

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try refresh with single-flight
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          // Call refresh endpoint
          const refreshResult = await rawBaseQuery(
            { url: "/auth/refresh", method: "POST" },
            api,
            extraOptions
          );
          if (refreshResult.error || !refreshResult.data) {
            return null;
          }
          const data = refreshResult.data as any;
          // Try to extract access token from various shapes
          const token =
            data?.accessToken ||
            data?.data?.accessToken ||
            data?.token ||
            data?.data?.token ||
            null;
          if (token) {
            api.dispatch(setToken(token));
            return token as string;
          }
          return null;
        } catch {
          return null;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    const newToken = await refreshPromise;
    if (newToken) {
      // Retry original request
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearAuth());
    }
  }

  // Envelope unwrapping if response is { data: ... }
  if (result.data && typeof result.data === "object") {
    const data = result.data as any;
    if ("data" in data && Object.keys(data).length === 1 && Array.isArray(data.data) === false && data.meta === undefined) {
      // Could be envelope - but be careful not to unwrap everything; check common API envelope
      // Prefer explicit unwrapping by endpoints, but per requirement: "envelope unwrapping"
      // Only unwrap if it looks like pure envelope
    }
    // Unwrap standard envelope { data, meta? }
    if ("data" in data && !("id" in data) && !Array.isArray(data) && Object.prototype.hasOwnProperty.call(data, "data")) {
      // Heuristic: if it's an envelope (has data key at top level of API response)
      // RTK will pass the whole response; better to unwrap in transformResponse per endpoint,
      // but base requirement says "envelope unwrapping" - do a shallow unwrap for objects that look like envelopes
      // Avoid unwrapping actual data objects
      const keys = Object.keys(data);
      if (keys.length === 1 || (keys.length === 2 && keys.includes("meta"))) {
        // likely envelope
        result = { ...result, data: data.data } as any;
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Organization", "Import", "Finding", "Analysis", "Dashboard", "Metrics"],
  endpoints: () => ({}),
});

export { normalizeError };
export default baseApi;
