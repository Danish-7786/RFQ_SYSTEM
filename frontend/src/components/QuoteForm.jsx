import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  submitQuote,
  clearQuoteStatus,
  selectSubmitLoading,
  selectSubmitError,
  selectSubmitSuccess,
} from "../store/slices/quoteSlice";
import {
  fetchRFQById,
  updateCurrentRFQFromQuote,
} from "../store/slices/rfqSlice";

const QuoteForm = ({ rfqId, rfqName }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const submitLoading = useSelector(selectSubmitLoading);
  const submitError = useSelector(selectSubmitError);
  const submitSuccess = useSelector(selectSubmitSuccess);

  const [formData, setFormData] = useState({
    carrierName: "",
    freightCharges: "",
    originCharges: "",
    destinationCharges: "",
    transitTime: "",
    quoteValidity: "",
  });

  useEffect(() => {
    return () => {
      dispatch(clearQuoteStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (submitSuccess) {
      // Refresh RFQ detail data after successful submission
      dispatch(fetchRFQById(rfqId));

      setFormData({
        carrierName: "",
        freightCharges: "",
        originCharges: "",
        destinationCharges: "",
        transitTime: "",
        quoteValidity: "",
      });
    }
  }, [submitSuccess, rfqId, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError || submitSuccess) dispatch(clearQuoteStatus());
  };

  const totalPrice =
    (Number(formData.freightCharges) || 0) +
    (Number(formData.originCharges) || 0) +
    (Number(formData.destinationCharges) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      rfqId,
      carrierName: formData.carrierName,
      freightCharges: Number(formData.freightCharges),
      originCharges: Number(formData.originCharges),
      destinationCharges: Number(formData.destinationCharges),
      transitTime: Number(formData.transitTime),
      quoteValidity: formData.quoteValidity,
    };

    const result = await dispatch(submitQuote(payload));

    if (submitQuote.fulfilled.match(result)) {
      // Update current RFQ state from the response
      dispatch(
        updateCurrentRFQFromQuote({
          rfq: result.payload.rfq,
          rankings: result.payload.rankings,
        })
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Submit Quote
      </h3>
      {rfqName && (
        <p className="text-sm text-gray-500 mb-4">For: {rfqName}</p>
      )}

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
          <span>⚠️</span>
          <span>{submitError}</span>
        </div>
      )}

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
          <span>✅</span>
          <span>Quote submitted successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Carrier Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="carrierName"
            value={formData.carrierName}
            onChange={handleChange}
            required
            placeholder="e.g., FastShip Logistics"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Freight Charges ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="freightCharges"
              value={formData.freightCharges}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origin Charges ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="originCharges"
              value={formData.originCharges}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination Charges ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="destinationCharges"
              value={formData.destinationCharges}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Total Price:
            </span>
            <span className="text-xl font-bold text-indigo-700">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transit Time (days) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="transitTime"
              value={formData.transitTime}
              onChange={handleChange}
              required
              min="1"
              placeholder="e.g., 5"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quote Validity <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="quoteValidity"
              value={formData.quoteValidity}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/rfq/${rfqId}`)}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
          >
            {submitLoading ? (
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
                <span>Submitting...</span>
              </span>
            ) : (
              "Submit Quote"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuoteForm;