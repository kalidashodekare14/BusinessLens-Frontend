import { baseApi } from "@/store/base-api";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<any, string>({
      query: (organizationId) => `/organizations/${organizationId}/dashboard`,
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      providesTags: ["Dashboard"],
    }),
    getMetricsOverview: builder.query<any, { organizationId: string; period?: string }>({
      query: ({ organizationId, period }) => ({
        url: `/organizations/${organizationId}/metrics/overview`,
        params: period ? { period } : undefined,
      }),
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      providesTags: ["Metrics"],
    }),
  }),
});

export const { useGetDashboardQuery, useGetMetricsOverviewQuery } = dashboardApi;
