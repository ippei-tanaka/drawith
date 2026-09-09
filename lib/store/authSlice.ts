import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authClient } from "@/lib/auth/client";

export interface AuthUser
{
  id: string;
  name: string;
  email: string;
}

interface AuthState
{
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
}

const initialState: AuthState = {
  user: null,
  status: "idle",
};

export const fetchSession = createAsyncThunk("auth/fetchSession", async ():Promise<AuthUser | null> => {
  const { data } = await authClient.getSession();
  const user = data?.user ?? null;
  return user ? { id: user.id, name: user.name, email: user.email } : null;
});

export const signOut = createAsyncThunk("auth/signOut", async () => {
  await authClient.signOut();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSession.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload ? "authenticated" : "unauthenticated";
      })
      .addCase(fetchSession.rejected, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      });
  },
});

export default authSlice.reducer;
