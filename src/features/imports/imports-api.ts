import { baseApi } from "@/store/base-api";
import type { Import, ImportMapping } from "@/types/api";

export interface CreateImportParams {
  organizationId: string;
  type: "ORDERS" | "PRODUCTS";
  file: File;
}

export interface UpdateImportMappingParams {
  organizationId: string;
  importId: string;
  mapping: ImportMapping;
}

export const importsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listImports: builder.query<Import[], string>({
      query: (organizationId) => `/organizations/${organizationId}/imports`,
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      providesTags: ["Import"],
    }),
    getImport: builder.query<Import, { organizationId: string; importId: string }>({
      query: ({ organizationId, importId }) => `/organizations/${organizationId}/imports/${importId}`,
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      providesTags: (result, error, arg) => [{ type: "Import", id: arg.importId }],
    }),
    createImport: builder.mutation<Import, CreateImportParams>({
      query: ({ organizationId, type, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        return {
          url: `/organizations/${organizationId}/imports`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: ["Import"],
    }),
    updateImportMapping: builder.mutation<Import, UpdateImportMappingParams>({
      query: ({ organizationId, importId, mapping }) => ({
        url: `/organizations/${organizationId}/imports/${importId}/mapping`,
        method: "PATCH",
        body: { mapping },
      }),
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, arg) => [
        { type: "Import", id: arg.importId },
        "Import",
      ],
    }),
    confirmImport: builder.mutation<Import, { organizationId: string; importId: string }>({
      query: ({ organizationId, importId }) => ({
        url: `/organizations/${organizationId}/imports/${importId}/confirm`,
        method: "POST",
      }),
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, arg) => [
        { type: "Import", id: arg.importId },
        "Import",
        "Finding",
        "Dashboard",
        "Metrics",
        "Analysis",
      ],
    }),
  }),
});

export const {
  useListImportsQuery,
  useGetImportQuery,
  useCreateImportMutation,
  useUpdateImportMappingMutation,
  useConfirmImportMutation,
} = importsApi;
