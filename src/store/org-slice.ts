import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const ORG_KEY = "bl_current_org_id";

interface OrgState {
  currentOrganizationId: string | null;
}

function loadOrgId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ORG_KEY);
  } catch {
    return null;
  }
}

const initialState: OrgState = {
  currentOrganizationId: loadOrgId(),
};

const orgSlice = createSlice({
  name: "org",
  initialState,
  reducers: {
    setCurrentOrganizationId(state, action: PayloadAction<string | null>) {
      state.currentOrganizationId = action.payload;
      if (typeof window !== "undefined") {
        try {
          if (action.payload) {
            localStorage.setItem(ORG_KEY, action.payload);
          } else {
            localStorage.removeItem(ORG_KEY);
          }
        } catch {}
      }
    },
    clearOrg(state) {
      state.currentOrganizationId = null;
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(ORG_KEY);
        } catch {}
      }
    },
  },
});

export const { setCurrentOrganizationId, clearOrg } = orgSlice.actions;
export const selectCurrentOrgId = (state: any) => state.org?.currentOrganizationId;
export default orgSlice.reducer;