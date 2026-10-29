import { baseApi } from "@/store/base-api";
import type { Finding, FindingExplanation, FindingNote } from "@/types/api";

export interface ListFindingsParams {
  organizationId: string;
  status?: string;
  severity?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

const findingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listFindings: builder.query<Finding[], ListFindingsParams>({
      query: ({ organizationId, ...params }) => ({
        url: `/organizations/${organizationId}/findings`,
        params,
      }),
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      providesTags: ["Finding"],
    }),
    getFinding: builder.query<Finding, { organizationId: string; findingId: string }>({
      query: ({ organizationId, findingId }) => `/organizations/${organizationId}/findings/${findingId}`,
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      providesTags: (result, error, arg) => [{ type: "Finding", id: arg.findingId }],
    }),
    updateFindingStatus: builder.mutation<Finding, { organizationId: string; findingId: string; status: string }>({
      query: ({ organizationId, findingId, status }) => ({
        url: `/organizations/${organizationId}/findings/${findingId}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, arg) => [
        { type: "Finding", id: arg.findingId },
        "Finding",
        "Dashboard",
      ],
    }),
    getFindingNotes: builder.query<FindingNote[], { organizationId: string; findingId: string }>({
      query: ({ organizationId, findingId }) => `/organizations/${organizationId}/findings/${findingId}/notes`,
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      providesTags: (result, error, arg) => [{ type: "Finding", id: `notes-${arg.findingId}` }],
    }),
    addFindingNote: builder.mutation<FindingNote, { organizationId: string; findingId: string; content: string }>({
      query: ({ organizationId, findingId, content }) => ({
        url: `/organizations/${organizationId}/findings/${findingId}/notes`,
        method: "POST",
        body: { content },
      }),
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, arg) => [{ type: "Finding", id: `notes-${arg.findingId}` }],
    }),
    deleteFindingNote: builder.mutation<void, { organizationId: string; findingId: string; noteId: string }>({
      query: ({ organizationId, findingId, noteId }) => ({
        url: `/organizations/${organizationId}/findings/${findingId}/notes/${noteId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Finding", id: `notes-${arg.findingId}` }],
    }),
    getFindingExplanation: builder.query<FindingExplanation, { organizationId: string; findingId: string }>({
      query: ({ organizationId, findingId }) => `/organizations/${organizationId}/findings/${findingId}/explanation`,
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      providesTags: (result, error, arg) => [{ type: "Finding", id: `explanation-${arg.findingId}` }],
    }),
    regenerateFindingExplanation: builder.mutation<FindingExplanation, { organizationId: string; findingId: string }>({
      query: ({ organizationId, findingId }) => ({
        url: `/organizations/${organizationId}/findings/${findingId}/explanation/regenerate`,
        method: "POST",
      }),
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, arg) => [{ type: "Finding", id: `explanation-${arg.findingId}` }],
    }),
  }),
});

export const {
  useListFindingsQuery,
  useGetFindingQuery,
  useUpdateFindingStatusMutation,
  useGetFindingNotesQuery,
  useAddFindingNoteMutation,
  useDeleteFindingNoteMutation,
  useGetFindingExplanationQuery,
  useRegenerateFindingExplanationMutation,
} = findingsApi;
