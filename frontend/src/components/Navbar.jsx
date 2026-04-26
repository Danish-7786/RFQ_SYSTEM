import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, selectUser, selectIsBuyer } from "../store/slices/authSlice";

const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isBuyer = useSelector(selectIsBuyer);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BA</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                RFQ Auction
              </span>
            </Link>

            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              All Auctions
            </Link>

            {isBuyer && (
              <Link
                to="/create"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/create")
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                + Create RFQ
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">
                {user?.name}
              </div>
              <div className="flex items-center justify-end space-x-1">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                    isBuyer
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {user?.role?.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  {user?.companyName}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;