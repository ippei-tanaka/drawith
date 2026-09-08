import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import boardReducer from "./boardSlice";

// Create a new store per request/provider instance (App Router best practice).
export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      board: boardReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
