import { baseApi } from "@/store/base-api";
import type { AuthResponse, User, Organization } from "@/types/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateOrgRequest {
  name: string;
  currency?: string;
  timezone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        // Handle envelope
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
    }),
    refresh: builder.mutation<{ accessToken?: string }, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    getMe: builder.query<User, void>({
      query: () => "/users/me",
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      providesTags: ["User"],
    }),
    updateMe: builder.mutation<User, { name: string }>({
      query: (body) => ({
        url: "/users/me",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({
        url: "/users/me/change-password",
        method: "POST",
        body,
      }),
    }),
    createOrganization: builder.mutation<Organization, CreateOrgRequest>({
      query: (body) => ({
        url: "/organizations",
        method: "POST",
        body: { name: body.name },
      }),
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: ["Organization"],
    }),
    getOrganizations: builder.query<Organization[], void>({
      query: () => "/organizations",
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      providesTags: ["Organization"],
    }),
    getOrganization: builder.query<Organization, string>({
      query: (organizationId) => `/organizations/${organizationId}`,
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      providesTags: (result, error, arg) => [{ type: "Organization", id: arg }],
    }),
    updateOrganization: builder.mutation<Organization, { organizationId: string; name: string }>({
      query: ({ organizationId, name }) => ({
        url: `/organizations/${organizationId}`,
        method: "PATCH",
        body: { name },
      }),
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, arg) => [{ type: "Organization", id: arg.organizationId }, "Organization"],
    }),
    loadDemoData: builder.mutation<any, string>({
      query: (organizationId) => ({
        url: `/organizations/${organizationId}/demo-data`,
        method: "POST",
      }),
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && Object.keys(response).length <= 2) {
          return response.data;
        }
        return response;
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useChangePasswordMutation,
  useCreateOrganizationMutation,
  useGetOrganizationsQuery,
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useLoadDemoDataMutation,
} = authApi;
