import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createRFQ,
  clearRFQErrors,
  selectRFQCreateLoading,
  selectRFQCreateError,
} from "../store/slices/rfqSlice";

const triggerTypeDescriptions = {
  BID_RECEIVED: "Extends when any bid is received in the trigger window.",
  ANY_RANK_CHANGE:
    "Extends when any supplier rank changes in the trigger window.",
  L1_RANK_CHANGE:
    "Extends only when the lowest bidder (L1) changes in the trigger window.",
};

const RFQForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const createLoading = useSelector(selectRFQCreateLoading);
  const createError = useSelector(selectRFQCreateError);

  const [formData, setFormData] = useState({
    name: "",
    bidStartTime: "",
    bidCloseTime: "",
    forcedBidCloseTime: "",
    pickupServiceDate: "",
    triggerWindowMinutes: 10,
    extensionDurationMinutes: 5,
    extensionTriggerType: "BID_RECEIVED",
  });

  useEffect(() => {
    return () => {
      dispatch(clearRFQErrors());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (createError) dispatch(clearRFQErrors());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      triggerWindowMinutes: Number(formData.triggerWindowMinutes),
      extensionDurationMinutes: Number(formData.extensionDurationMinutes),
    };

    const result = await dispatch(createRFQ(payload));

    if (createRFQ.fulfilled.match(result)) {
      navigate(`/rfq/${result.payload._id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {createError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <span className="text-red-500">⚠️</span>
          <span>{createError}</span>
        </div>
      )}

      {/* RFQ Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          RFQ Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., Shipping Contract Q1 2025"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
      </div>

      {/* Date Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bid Start Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="bidStartTime"
            value={formData.bidStartTime}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bid Close Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="bidCloseTime"
            value={formData.bidCloseTime}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Forced Bid Close Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="forcedBidCloseTime"
            value={formData.forcedBidCloseTime}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be later than Bid Close Time. Auction cannot extend beyond
            this.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup / Service Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="pickupServiceDate"
            value={formData.pickupServiceDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>
      </div>

      {/* British Auction Config */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          ⚙️ British Auction Configuration
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Configure how the auction extends when activity occurs near close time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trigger Window (X Min)
            </label>
            <input
              type="number"
              name="triggerWindowMinutes"
              value={formData.triggerWindowMinutes}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              Monitor last X minutes before close
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Extension Duration (Y Min)
            </label>
            <input
              type="number"
              name="extensionDurationMinutes"
              value={formData.extensionDurationMinutes}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              Extend by Y minutes when triggered
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Extension Trigger
            </label>
            <select
              name="extensionTriggerType"
              value={formData.extensionTriggerType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            >
              <option value="BID_RECEIVED">Bid Received</option>
              <option value="ANY_RANK_CHANGE">Any Rank Change</option>
              <option value="L1_RANK_CHANGE">L1 (Lowest) Change</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {triggerTypeDescriptions[formData.extensionTriggerType]}
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">
          📋 How It Works:
        </h4>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>
            If the trigger event occurs in the last{" "}
            <strong>{formData.triggerWindowMinutes} min</strong> before close,
            auction extends by{" "}
            <strong>{formData.extensionDurationMinutes} min</strong>.
          </li>
          <li>Extensions never exceed the Forced Bid Close Time.</li>
          <li>This prevents last-second bidding manipulation.</li>
        </ul>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createLoading}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
        >
          {createLoading ? (
            <span className="flex items-center space-x-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Creating...</span>
            </span>
          ) : (
            "Create RFQ"
          )}
        </button>
      </div>
    </form>
  );
};

export default RFQForm;