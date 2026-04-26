import React from "react";
import { useSelector } from "react-redux";
import { selectIsBuyer } from "../store/slices/authSlice";
import RFQList from "../components/RFQList";
import { Link } from "react-router-dom";

const HomePage = () => {
  const isBuyer = useSelector(selectIsBuyer);

  return (
    <div>
  
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isBuyer ? "My Auctions" : "Available Auctions"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isBuyer
              ? "Manage your British Auction RFQs and view bids."
              : "Browse active auctions and submit competitive bids."}
          </p>
        </div>
        {isBuyer && (
          <Link
            to="/create"
            className="mt-4 sm:mt-0 inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition shadow-sm"
          >
            <span className="mr-1">+</span> Create New RFQ
          </Link>
        )}
      </div>

      <RFQList />
    </div>
  );
};

export default HomePage;