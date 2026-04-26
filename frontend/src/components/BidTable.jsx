import React from "react";
import { useSelector } from "react-redux";
import {
  selectCurrentRankings,
  selectCurrentQuotes,
} from "../store/slices/rfqSlice";
import { selectIsBuyer, selectUser } from "../store/slices/authSlice";

const rankColors = {
  1: "bg-yellow-100 text-yellow-800 border-yellow-400",
  2: "bg-gray-100 text-gray-700 border-gray-400",
  3: "bg-orange-100 text-orange-800 border-orange-400",
};

const BidTable = () => {
  const rankings = useSelector(selectCurrentRankings);
  const quotes = useSelector(selectCurrentQuotes);
  const isBuyer = useSelector(selectIsBuyer);
  const user = useSelector(selectUser);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatDateTime = (dateStr) =>
    new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  if (!rankings || rankings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
        <div className="text-gray-300 text-6xl mb-4">💰</div>
        <h3 className="text-lg font-medium text-gray-700 mb-1">
          No Bids Submitted Yet
        </h3>
        <p className="text-sm text-gray-400">
          {isBuyer
            ? "Waiting for suppliers to submit their quotes."
            : "Be the first to submit a competitive bid!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rankings Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>🏆</span>
            <span>Supplier Rankings</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Ranked by lowest total price
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Carrier
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rankings.map((r) => {
                const isYou = r.isYou || false;
                const badgeColor =
                  rankColors[r.rank] ||
                  "bg-gray-50 text-gray-600 border-gray-300";

                return (
                  <tr
                    key={r.rank}
                    className={`transition ${
                      isYou ? "bg-indigo-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 ${badgeColor}`}
                      >
                        L{r.rank}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {r.carrierName}
                        </span>
                        {isYou && (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span
                        className={`text-sm font-bold ${
                          r.rank === 1 ? "text-green-700" : "text-gray-800"
                        }`}
                      >
                        ${r.totalPrice.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Quotes (Buyer sees all, Supplier sees own) */}
      {quotes && quotes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <span>📄</span>
              <span>{isBuyer ? "All Quote Details" : "Your Submitted Quotes"}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isBuyer
                ? `${quotes.length} quote(s) received`
                : `${quotes.length} quote(s) submitted by you`}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Carrier
                  </th>
                  {isBuyer && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Supplier
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Freight
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Origin
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Destination
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Transit
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Validity
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.map((q, index) => (
                  <tr key={q._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {q.carrierName}
                    </td>
                    {isBuyer && (
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {q.supplierId?.companyName || q.supplierId?.name || "—"}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      ${q.freightCharges.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      ${q.originCharges.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      ${q.destinationCharges.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                      ${q.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                      {q.transitTime} day{q.transitTime > 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                      {formatDate(q.quoteValidity)}
                    </td>
                    <td className="px-4 py-3 text-xs text-center text-gray-500">
                      {formatDateTime(q.submittedAt || q.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidTable;