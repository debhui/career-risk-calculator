// store/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session } from "@supabase/supabase-js"; // Supabase type

export interface AuthState {
  session: Session | null;
  user: any | null; // Use a more specific user type if you have one
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: AuthState = {
  session: null,
  user: null,
  isAuthenticated: false,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
      state.user = action.payload ? action.payload.user : null;
      state.status = "succeeded";
      state.isAuthenticated = action.payload !== null;
    },
    signOut: () => initialState,
  },
});

export const { setSession, signOut } = authSlice.actions;
export default authSlice.reducer;
