import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export const fetchAllRFQs = createAsyncThunk(
  "rfq/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/rfqs");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch RFQs"
      );
    }
  }
);

export const fetchRFQById = createAsyncThunk(
  "rfq/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/rfqs/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch RFQ"
      );
    }
  }
);

export const createRFQ = createAsyncThunk(
  "rfq/create",
  async (rfqData, { rejectWithValue }) => {
    try {
      const response = await api.post("/rfqs", rfqData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create RFQ"
      );
    }
  }
);

const rfqSlice = createSlice({
  name: "rfq",
  initialState: {
    rfqs: [],
    currentRFQ: null,
    currentQuotes: [],
    currentRankings: [],
    loading: false,
    detailLoading: false,
    createLoading: false,
    error: null,
    createError: null,
    detailError: null,
  },
  reducers: {
    clearRFQErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.detailError = null;
    },
    clearCurrentRFQ: (state) => {
      state.currentRFQ = null;
      state.currentQuotes = [];
      state.currentRankings = [];
      state.detailError = null;
    },
    updateCurrentRFQFromQuote: (state, action) => {
      const { rfq, rankings } = action.payload;
      if (rfq) {
        state.currentRFQ = rfq;
      }
      if (rankings) {
        state.currentRankings = rankings;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllRFQs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRFQs.fulfilled, (state, action) => {
        state.loading = false;
        state.rfqs = action.payload;
      })
      .addCase(fetchAllRFQs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch By ID
      .addCase(fetchRFQById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchRFQById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentRFQ = action.payload.rfq;
        state.currentQuotes = action.payload.quotes;
        state.currentRankings = action.payload.rankings;
      })
      .addCase(fetchRFQById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      })
      // Create
      .addCase(createRFQ.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createRFQ.fulfilled, (state, action) => {
        state.createLoading = false;
        state.rfqs.unshift(action.payload);
      })
      .addCase(createRFQ.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      });
  },
});

export const { clearRFQErrors, clearCurrentRFQ, updateCurrentRFQFromQuote } =
  rfqSlice.actions;

export const selectAllRFQs = (state) => state.rfq.rfqs;
export const selectCurrentRFQ = (state) => state.rfq.currentRFQ;
export const selectCurrentQuotes = (state) => state.rfq.currentQuotes;
export const selectCurrentRankings = (state) => state.rfq.currentRankings;
export const selectRFQLoading = (state) => state.rfq.loading;
export const selectRFQDetailLoading = (state) => state.rfq.detailLoading;
export const selectRFQCreateLoading = (state) => state.rfq.createLoading;
export const selectRFQError = (state) => state.rfq.error;
export const selectRFQCreateError = (state) => state.rfq.createError;
export const selectRFQDetailError = (state) => state.rfq.detailError;

export default rfqSlice.reducer;