import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./Firebase";
import "./index.css";
import App from "./App";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import Payments from "./components/PaymentSetup";
import BecomeSeller from "./components/BecomeSeller";
import CreateProduct from "./components/CreateProduct";
import ProductDetails from "./components/ProductDetails";
import SignupPage from "./Signup";
import BecomeAffiliate from "./components/BecomeAfiliate";
import reportWebVitals from "./reportWebVitals";
import { motion } from "framer-motion";

// LoadingSpinner component
const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <motion.div
        className="w-16 h-16 border-4 border-t-yellow-400 border-gray-700 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    </div>
  );
};

// ProtectedRoute component to restrict access to authenticated users
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/become-seller"
          element={
            <ProtectedRoute>
              <BecomeSeller />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-product"
          element={
            <ProtectedRoute>
              <CreateProduct />
            </ProtectedRoute>
          }
        />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route
          path="/become-affiliate"
          element={
            <ProtectedRoute>
              <BecomeAffiliate />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
