import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRFQById,
  clearCurrentRFQ,
  selectCurrentRFQ,
  selectCurrentRankings,
  selectRFQDetailLoading,
  selectRFQDetailError,
} from "../store/slices/rfqSlice";
import QuoteForm from "../components/QuoteForm";
import AuctionTimer from "../components/AuctionTimer";

const statusConfig = {
  UPCOMING: {
    color: "bg-blue-100 text-blue-800",
    dot: "bg-blue-500",
    label: "Upcoming",
  },
  ACTIVE: {
    color: "bg-green-100 text-green-800",
    dot: "bg-green-500",
    label: "Active",
  },
  CLOSED: {
    color: "bg-gray-100 text-gray-800",
    dot: "bg-gray-500",
    label: "Closed",
  },
  FORCE_CLOSED: {
    color: "bg-red-100 text-red-800",
    dot: "bg-red-500",
    label: "Force Closed",
  },
};

const SubmitQuotePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const rfq = useSelector(selectCurrentRFQ);
  const rankings = useSelector(selectCurrentRankings);
  const loading = useSelector(selectRFQDetailLoading);
  const error = useSelector(selectRFQDetailError);

  useEffect(() => {
    dispatch(fetchRFQById(id));

    const interval = setInterval(() => {
      dispatch(fetchRFQById(id));
    }, 5000);

    return () => {
      clearInterval(interval);
      dispatch(clearCurrentRFQ());
    };
  }, [id, dispatch]);

  if (loading && !rfq) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Failed to Load RFQ
        </h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <Link
          to="/"
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Back to Auctions
        </Link>
      </div>
    );
  }

  if (!rfq) return null;

  const config = statusConfig[rfq.status] || statusConfig.CLOSED;
  const isActive = rfq.status === "ACTIVE";

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-indigo-600 transition">
          Auctions
        </Link>
        <span className="mx-2">/</span>
        <Link
          to={`/rfq/${rfq._id}`}
          className="hover:text-indigo-600 transition"
        >
          {rfq.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Submit Quote</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Submit Bid — {rfq.name}
          </h1>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.color}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`}
            ></span>
            {config.label}
          </span>
        </div>
        <p className="text-sm text-gray-500 font-mono">{rfq.referenceId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quote Form */}
        <div className="lg:col-span-2">
          {isActive ? (
            <QuoteForm rfqId={rfq._id} rfqName={rfq.name} />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bidding is Closed
              </h3>
              <p className="text-gray-500 mb-4">
                This auction is currently{" "}
                <strong>{config.label.toLowerCase()}</strong>. Bids cannot be
                submitted.
              </p>
              <Link
                to={`/rfq/${rfq._id}`}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← View Auction Details
              </Link>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Timers */}
          <AuctionTimer
            targetTime={rfq.currentBidCloseTime}
            label="⏰ Bid Close"
          />
          <AuctionTimer
            targetTime={rfq.forcedBidCloseTime}
            label="🛑 Forced Close"
            isForced
          />

          {/* Current Rankings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-900">
                🏆 Current Rankings
              </h4>
            </div>
            {rankings && rankings.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {rankings.map((r) => (
                  <div
                    key={r.rank}
                    className={`px-4 py-3 flex items-center justify-between ${
                      r.isYou ? "bg-indigo-50" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          r.rank === 1
                            ? "bg-yellow-100 text-yellow-800"
                            : r.rank === 2
                            ? "bg-gray-100 text-gray-700"
                            : r.rank === 3
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        L{r.rank}
                      </span>
                      <div>
                        <span className="text-sm font-medium text-gray-800">
                          {r.carrierName}
                        </span>
                        {r.isYou && (
                          <span className="ml-1.5 text-xs font-semibold text-indigo-600">
                            (You)
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        r.rank === 1 ? "text-green-700" : "text-gray-700"
                      }`}
                    >
                      ${r.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                No bids yet. Be the first!
              </div>
            )}
          </div>

          {/* Auction Config Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              ⚙️ Auction Rules
            </h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Trigger Window:</span>
                <span className="font-semibold text-gray-900">
                  {rfq.triggerWindowMinutes} min
                </span>
              </div>
              <div className="flex justify-between">
                <span>Extension:</span>
                <span className="font-semibold text-gray-900">
                  {rfq.extensionDurationMinutes} min
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trigger:</span>
                <span className="font-semibold text-gray-900">
                  {rfq.extensionTriggerType === "BID_RECEIVED"
                    ? "Any Bid"
                    : rfq.extensionTriggerType === "ANY_RANK_CHANGE"
                    ? "Rank Change"
                    : "L1 Change"}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 leading-relaxed">
                If the trigger event happens within the last{" "}
                {rfq.triggerWindowMinutes} min, the auction extends by{" "}
                {rfq.extensionDurationMinutes} min (never past forced close).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitQuotePage;