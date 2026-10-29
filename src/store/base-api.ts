import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * RTK Query base API.
 * Full baseQuery with auth header, envelope unwrap, error normalization,
 * refresh-on-401 with single-flight is implemented in F1.1/F1.2.
 * This stub keeps the store wiring valid for F0 builds.
 */
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1",
    credentials: "include",
  }),
  endpoints: () => ({}),
});

export default baseApi;