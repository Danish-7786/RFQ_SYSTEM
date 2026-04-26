import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../store/slices/authSlice";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useSelector(selectUser);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-500">
          Your role (<strong>{user.role}</strong>) does not have permission to
          access this page.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;