import React, { useState, useEffect } from "react";

const AuctionTimer = ({ targetTime, label, isForced }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setIsUrgent(false);
        setIsExpired(true);
        return;
      }

      setIsExpired(false);
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
          s
        ).padStart(2, "0")}`
      );
      setIsUrgent(diff < 5 * 60 * 1000);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const bgColor = isExpired
    ? "bg-gray-100 border-gray-300"
    : isUrgent && !isForced
    ? "bg-red-50 border-red-300"
    : isForced
    ? "bg-orange-50 border-orange-200"
    : "bg-indigo-50 border-indigo-200";

  const textColor = isExpired
    ? "text-gray-400"
    : isUrgent && !isForced
    ? "text-red-600"
    : isForced
    ? "text-orange-600"
    : "text-indigo-600";

  return (
    <div className={`p-4 rounded-xl border-2 ${bgColor} transition-colors`}>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div
        className={`text-3xl font-mono font-bold ${textColor} ${
          isUrgent && !isForced && !isExpired ? "animate-pulse" : ""
        }`}
      >
        {timeLeft}
      </div>
      <div className="text-xs text-gray-500 mt-1.5">
        {new Date(targetTime).toLocaleString()}
      </div>
      {isExpired && (
        <span className="inline-block mt-1.5 text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
          Expired
        </span>
      )}
      {isUrgent && !isForced && !isExpired && (
        <span className="inline-block mt-1.5 text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded">
          ⚡ Closing Soon
        </span>
      )}
    </div>
  );
};

export default AuctionTimer;