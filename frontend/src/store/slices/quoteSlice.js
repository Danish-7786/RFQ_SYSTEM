import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";


export const submitQuote = createAsyncThunk(
  "quote/submit",
  async (quoteData, { rejectWithValue }) => {
    try {
      const response = await api.post("/quotes", quoteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to submit quote"
      );
    }
  }
);

export const fetchQuotesByRFQ = createAsyncThunk(
  "quote/fetchByRFQ",
  async (rfqId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quotes/rfq/${rfqId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch quotes"
      );
    }
  }
);

const quoteSlice = createSlice({
  name: "quote",
  initialState: {
    submitLoading: false,
    submitError: null,
    submitSuccess: false,
    lastSubmittedQuote: null,
    quotesLoading: false,
    quotesError: null,
  },
  reducers: {
    clearQuoteStatus: (state) => {
      state.submitError = null;
      state.submitSuccess = false;
      state.lastSubmittedQuote = null;
    },
    resetSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Quote
      .addCase(submitQuote.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
        state.submitSuccess = false;
      })
      .addCase(submitQuote.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.submitSuccess = true;
        state.lastSubmittedQuote = action.payload;
      })
      .addCase(submitQuote.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
        state.submitSuccess = false;
      })
      // Fetch Quotes
      .addCase(fetchQuotesByRFQ.pending, (state) => {
        state.quotesLoading = true;
        state.quotesError = null;
      })
      .addCase(fetchQuotesByRFQ.fulfilled, (state) => {
        state.quotesLoading = false;
      })
      .addCase(fetchQuotesByRFQ.rejected, (state, action) => {
        state.quotesLoading = false;
        state.quotesError = action.payload;
      });
  },
});

export const { clearQuoteStatus, resetSubmitSuccess } = quoteSlice.actions;

export const selectSubmitLoading = (state) => state.quote.submitLoading;
export const selectSubmitError = (state) => state.quote.submitError;
export const selectSubmitSuccess = (state) => state.quote.submitSuccess;
export const selectLastSubmittedQuote = (state) => state.quote.lastSubmittedQuote;

export default quoteSlice.reducer;