import { baseApi } from "@/store/base-api";
import type { Finding, FindingExplanation, FindingNote } from "@/types/api";

export interface ListFindingsParams {
  organizationId: string;
  status?: string;
  severity?: string;
  type?: string;
  analysisRunId?: string;
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
        const data =
          response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2
            ? response.data
            : response;
        if (data && data.explanation && data.explanation.content) {
          const content = data.explanation.content;
          data.explanation = {
            ...data.explanation,
            summary: content.summary ?? data.explanation.summary,
            observedFacts: content.observedFacts ?? data.explanation.observedFacts,
            associatedSignals: content.associatedSignals ?? data.explanation.associatedSignals,
            possibleExplanations: content.possibleExplanations ?? data.explanation.possibleExplanations,
            investigationSteps: content.investigationSteps ?? data.explanation.investigationSteps,
            whatWeDontKnow: content.uncertainty ? [content.uncertainty] : data.explanation.whatWeDontKnow,
            rawText: data.explanation.rawText,
            errorMessage: data.explanation.errorMessage,
            status: data.explanation.status,
            updatedAt: data.explanation.updatedAt,
          };
        }
        if (data && Array.isArray(data.notes)) {
          data.notes = data.notes.map((n: any) => ({
            ...n,
            body: n.body ?? n.content ?? "",
          }));
        }
        return data;
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
    addFindingNote: builder.mutation<FindingNote, { organizationId: string; findingId: string; body: string }>({
      query: ({ organizationId, findingId, body }) => ({
        url: `/organizations/${organizationId}/findings/${findingId}/notes`,
        method: "POST",
        body: { body },
      }),
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, arg) => [{ type: "Finding", id: arg.findingId }, "Finding"],
    }),
    deleteFindingNote: builder.mutation<void, { organizationId: string; findingId: string; noteId: string }>({
      query: ({ organizationId, findingId, noteId }) => ({
        url: `/organizations/${organizationId}/findings/${findingId}/notes/${noteId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Finding", id: arg.findingId }, "Finding"],
    }),
    regenerateFindingExplanation: builder.mutation<FindingExplanation, { organizationId: string; findingId: string }>({
      query: ({ organizationId, findingId }) => ({
        url: `/organizations/${organizationId}/findings/${findingId}/explanation`,
        method: "POST",
      }),
      transformResponse: (response: any) => {
        const data =
          response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2
            ? response.data
            : response;
        if (data && data.content) {
          const content = data.content;
          return {
            ...data,
            summary: content.summary ?? data.summary,
            observedFacts: content.observedFacts ?? data.observedFacts,
            associatedSignals: content.associatedSignals ?? data.associatedSignals,
            possibleExplanations: content.possibleExplanations ?? data.possibleExplanations,
            investigationSteps: content.investigationSteps ?? data.investigationSteps,
            whatWeDontKnow: content.uncertainty ? [content.uncertainty] : data.whatWeDontKnow,
          };
        }
        return data;
      },
      invalidatesTags: (result, error, arg) => [{ type: "Finding", id: arg.findingId }, "Finding"],
    }),
  }),
});

export const {
  useListFindingsQuery,
  useGetFindingQuery,
  useUpdateFindingStatusMutation,
  useAddFindingNoteMutation,
  useDeleteFindingNoteMutation,
  useRegenerateFindingExplanationMutation,
} = findingsApi;