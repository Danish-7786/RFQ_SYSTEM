import React from "react";
import { Link } from "react-router-dom";
import RFQForm from "../components/RFQForm";

const CreateRFQPage = () => {
  return (
    <div>
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-indigo-600 transition">
          Auctions
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Create New RFQ</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Create British Auction RFQ
        </h1>
        <p className="text-gray-500 mt-1">
          Set up a new RFQ with British Auction rules for competitive supplier
          bidding.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        <RFQForm />
      </div>
    </div>
  );
};

export default CreateRFQPage;