import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllRFQs,
  selectAllRFQs,
  selectRFQLoading,
  selectRFQError,
} from "../store/slices/rfqSlice";
import { selectIsBuyer, selectIsSupplier } from "../store/slices/authSlice";

const statusConfig = {
  UPCOMING: { color: "bg-blue-100 text-blue-800", label: "Upcoming", dot: "bg-blue-500" },
  ACTIVE: { color: "bg-green-100 text-green-800", label: "Active", dot: "bg-green-500" },
  CLOSED: { color: "bg-gray-100 text-gray-800", label: "Closed", dot: "bg-gray-500" },
  FORCE_CLOSED: {
    color: "bg-red-100 text-red-800",
    label: "Force Closed",
    dot: "bg-red-500",
  },
};

const RFQList = () => {
  const dispatch = useDispatch();
  const rfqs = useSelector(selectAllRFQs);
  const loading = useSelector(selectRFQLoading);
  const error = useSelector(selectRFQError);
  const isBuyer = useSelector(selectIsBuyer);
  const isSupplier = useSelector(selectIsSupplier);

  useEffect(() => {
    dispatch(fetchAllRFQs());
    const interval = setInterval(() => dispatch(fetchAllRFQs()), 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const formatDateTime = (dateStr) =>
    new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading && rfqs.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (rfqs.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
        <div className="text-gray-400 text-5xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Auctions Yet
        </h3>
        <p className="text-gray-500 mb-4">
          {isBuyer
            ? "Create your first British Auction RFQ to get started."
            : "No auctions are available yet. Check back soon."}
        </p>
        {isBuyer && (
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            + Create RFQ
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {["ACTIVE", "UPCOMING", "CLOSED", "FORCE_CLOSED"].map((status) => {
          const count = rfqs.filter((r) => r.status === status).length;
          const config = statusConfig[status];
          return (
            <div
              key={status}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center space-x-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
                <span className="text-xs font-medium text-gray-500 uppercase">
                  {config.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  RFQ Name / ID
                </th>
                {isBuyer && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Bids
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Lowest Bid
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Current Close
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Forced Close
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rfqs.map((rfq) => {
                const config = statusConfig[rfq.status] || statusConfig.CLOSED;
                return (
                  <tr key={rfq._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {rfq.name}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {rfq.referenceId}
                      </div>
                    </td>
                    {isBuyer && (
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">
                          {rfq.bidCount || 0}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      {rfq.currentLowestBid !== null &&
                      rfq.currentLowestBid !== undefined ? (
                        <div>
                          <div className="text-sm font-bold text-green-700">
                            ${rfq.currentLowestBid.toFixed(2)}
                          </div>
                          {isBuyer && rfq.lowestBidCarrier && (
                            <div className="text-xs text-gray-500">
                              {rfq.lowestBidCarrier}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          No bids
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDateTime(rfq.currentBidCloseTime)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDateTime(rfq.forcedBidCloseTime)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`}
                        ></span>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <Link
                        to={`/rfq/${rfq._id}`}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        View
                      </Link>
                      {isSupplier && rfq.status === "ACTIVE" && (
                        <Link
                          to={`/rfq/${rfq._id}/submit-quote`}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                        >
                          Bid
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RFQList;