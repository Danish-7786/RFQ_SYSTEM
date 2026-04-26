import React, { useState } from "react";

const typeConfig = {
  BID_SUBMITTED: {
    icon: "💰",
    color: "bg-green-100 text-green-800 border-green-300",
    dotColor: "bg-green-500",
  },
  TIME_EXTENDED: {
    icon: "⏰",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    dotColor: "bg-yellow-500",
  },
  AUCTION_STARTED: {
    icon: "🚀",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    dotColor: "bg-blue-500",
  },
  AUCTION_CLOSED: {
    icon: "🔒",
    color: "bg-gray-100 text-gray-800 border-gray-300",
    dotColor: "bg-gray-500",
  },
  AUCTION_FORCE_CLOSED: {
    icon: "🛑",
    color: "bg-red-100 text-red-800 border-red-300",
    dotColor: "bg-red-500",
  },
};

const ActivityLog = ({ activityLog }) => {
  const [expanded, setExpanded] = useState(false);

  if (!activityLog || activityLog.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-300 text-5xl mb-3">📝</div>
        <h3 className="text-md font-medium text-gray-600">
          No Activity Yet
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Activity will appear here once the auction begins.
        </p>
      </div>
    );
  }

  const sortedLog = [...activityLog].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const displayedLog = expanded ? sortedLog : sortedLog.slice(0, 10);

  const formatTimestamp = (dateStr) =>
    new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>📋</span>
            <span>Activity Log</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {activityLog.length} event{activityLog.length !== 1 ? "s" : ""}{" "}
            recorded
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Legend */}
          <div className="hidden md:flex items-center space-x-3 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Bid</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              <span>Extension</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Start</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-gray-500"></span>
              <span>Close</span>
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {displayedLog.map((log, index) => {
          const config = typeConfig[log.type] || typeConfig.AUCTION_CLOSED;

          return (
            <div
              key={log._id || index}
              className="px-6 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start space-x-4">
                {/* Timeline dot */}
                <div className="flex flex-col items-center mt-1">
                  <div
                    className={`w-3 h-3 rounded-full ${config.dotColor} ring-2 ring-white`}
                  ></div>
                  {index < displayedLog.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{config.icon}</span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}
                      >
                        {log.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mt-1">{log.message}</p>

                  {log.reason && (
                    <div className="mt-1.5 flex items-start space-x-1">
                      <span className="text-xs text-gray-400 mt-0.5">↳</span>
                      <p className="text-xs text-gray-500 italic bg-gray-50 px-2 py-1 rounded">
                        Reason: {log.reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More / Less */}
      {sortedLog.length > 10 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition"
          >
            {expanded
              ? "Show Less"
              : `Show All ${sortedLog.length} Events`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;