import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import CreateRFQPage from "./pages/CreateRFQPage";
import RFQDetailPage from "./pages/RFQDetailPage";
import SubmitQuotePage from "./pages/SubmitQuotePage";

function AppRoutes() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <main
        className={user ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" : ""}
      >
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" replace /> : <RegisterPage />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <CreateRFQPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rfq/:id"
            element={
              <ProtectedRoute>
                <RFQDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rfq/:id/submit-quote"
            element={
              <ProtectedRoute allowedRoles={["supplier"]}>
                <SubmitQuotePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;