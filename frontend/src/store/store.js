import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import rfqReducer from "./slices/rfqSlice";
import quoteReducer from "./slices/quoteSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rfq: rfqReducer,
    quote: quoteReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});