import { RootState } from "@/store/store";
import { useAppSelector } from "@/store/hooks";

export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectIsAuthenticated = (state: RootState) => state.auth.status === "authenticated";
