import { baseApi } from "@/store/base-api";

export interface AnalysisRun {
  id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  createdAt: string;
  completedAt?: string;
  findingsCount?: number;
}

export const analysisApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listAnalysisRuns: builder.query<AnalysisRun[], string>({
      query: (organizationId) => `/organizations/${organizationId}/analysis-runs`,
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      providesTags: ["Analysis"],
    }),
    getAnalysisRun: builder.query<AnalysisRun, { organizationId: string; runId: string }>({
      query: ({ organizationId, runId }) => `/organizations/${organizationId}/analysis-runs/${runId}`,
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      providesTags: (result, error, arg) => [{ type: "Analysis", id: arg.runId }],
    }),
    startAnalysisRun: builder.mutation<AnalysisRun, string>({
      query: (organizationId) => ({
        url: `/organizations/${organizationId}/analysis-runs`,
        method: "POST",
      }),
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: ["Analysis"],
    }),
  }),
});

export const { useListAnalysisRunsQuery, useGetAnalysisRunQuery, useStartAnalysisRunMutation } = analysisApi;
