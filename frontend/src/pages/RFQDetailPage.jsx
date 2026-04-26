import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRFQById,
  clearCurrentRFQ,
  selectCurrentRFQ,
  selectRFQDetailLoading,
  selectRFQDetailError,
} from "../store/slices/rfqSlice";
import {
  selectIsBuyer,
  selectIsSupplier,
} from "../store/slices/authSlice";
import AuctionTimer from "../components/AuctionTimer";
import BidTable from "../components/BidTable";
import ActivityLog from "../components/ActivityLog";

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

const triggerTypeLabels = {
  BID_RECEIVED: "Bid Received in Window",
  ANY_RANK_CHANGE: "Any Supplier Rank Change",
  L1_RANK_CHANGE: "L1 (Lowest Bidder) Change",
};

const RFQDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const rfq = useSelector(selectCurrentRFQ);
  const loading = useSelector(selectRFQDetailLoading);
  const error = useSelector(selectRFQDetailError);
  const isBuyer = useSelector(selectIsBuyer);
  const isSupplier = useSelector(selectIsSupplier);

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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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
        <div className="text-red-400 text-5xl mb-4">❌</div>
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
  const wasExtended =
    new Date(rfq.currentBidCloseTime).getTime() !==
    new Date(rfq.bidCloseTime).getTime();

  return (
    <div>
     
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-indigo-600 transition">
          Auctions
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{rfq.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{rfq.name}</h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${config.dot} mr-1.5`}
              ></span>
              {config.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
              {rfq.referenceId}
            </span>
            {rfq.createdBy && (
              <span>
                Created by:{" "}
                <strong className="text-gray-700">
                  {rfq.createdBy.companyName || rfq.createdBy.name}
                </strong>
              </span>
            )}
            <span>
              Pickup: <strong className="text-gray-700">{formatDate(rfq.pickupServiceDate)}</strong>
            </span>
          </div>
        </div>

        {isSupplier && isActive && (
          <Link
            to={`/rfq/${rfq._id}/submit-quote`}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition shadow-sm"
          >
            💰 Submit Bid
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <AuctionTimer
          targetTime={rfq.currentBidCloseTime}
          label={
            wasExtended
              ? "⏰ Current Bid Close (Extended)"
              : "⏰ Bid Close Time"
          }
        />
        <AuctionTimer
          targetTime={rfq.forcedBidCloseTime}
          label="🛑 Forced Close Time"
          isForced
        />
        <AuctionTimer
          targetTime={rfq.bidStartTime}
          label="🚀 Auction Start"
        />
      </div>

      {wasExtended && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
          <span className="text-yellow-500 text-xl mt-0.5">⏰</span>
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Auction Time Extended
            </p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Original close: {formatDateTime(rfq.bidCloseTime)} → Current
              close: {formatDateTime(rfq.currentBidCloseTime)}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <span>⚙️</span>
          <span>Auction Configuration</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">
              Trigger Window
            </div>
            <div className="text-lg font-bold text-gray-900">
              {rfq.triggerWindowMinutes} min
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">
              Extension Duration
            </div>
            <div className="text-lg font-bold text-gray-900">
              {rfq.extensionDurationMinutes} min
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">
              Trigger Type
            </div>
            <div className="text-sm font-bold text-gray-900">
              {triggerTypeLabels[rfq.extensionTriggerType] ||
                rfq.extensionTriggerType}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">
              Original Close
            </div>
            <div className="text-sm font-bold text-gray-900">
              {formatDateTime(rfq.bidCloseTime)}
            </div>
          </div>
        </div>
      </div>

   
      <div className="mb-8">
        <BidTable />
      </div>

     
      <div className="mb-8">
        <ActivityLog activityLog={rfq.activityLog} />
      </div>
    </div>
  );
};

export default RFQDetailPage;