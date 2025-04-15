// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboard from "./pages/UserDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import VerifyOTPPage from "./pages/VerifyOTPPage";

const App = () => {
  // State to track the user's role (and authentication status)
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  // Function to update the role when the user logs in or out
  const updateRole = () => {
    const newRole = localStorage.getItem("role") || null;
    console.log("Updating role to:", newRole); // Log the new role
    setRole(newRole);
  };

  // Listen for changes in localStorage to update the role dynamically
  useEffect(() => {
    window.addEventListener("storage", updateRole);
    return () => {
      window.removeEventListener("storage", updateRole);
    };
  }, []);

  // ProtectedRoute Component for Role-Based Access Control
  const ProtectedRoute = ({ role: requiredRole, children }) => {
    console.log("Current Role:", role, "Required Role:", requiredRole); // Debugging
    return role === requiredRole ? children : <Navigate to="/login" replace />;
  };

  // Navbar Component (Dynamic based on authentication status)
  const Navbar = () => (
    <nav style={styles.navbar}>
      <div style={styles.logo}>Hire Ur Driver</div>
      <div style={styles.navLinks}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/register" style={styles.link}>Register</Link>
        {role ? (
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              updateRole(); // Update the role state
              window.location.href = "/";
            }}
            style={styles.logoutButton}
          >
            Logout
          </button>
        ) : (
          <Link to="/login" style={styles.link}>Login</Link>
        )}
      </div>
    </nav>
  );

  return (
    <Router>
      {/* Render the dynamic Navbar */}
      <Navbar />

      {/* Define Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage updateRole={updateRole} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route
          path="/user-dashboard"
          element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>}
        />
        <Route
          path="/driver-dashboard"
          element={<ProtectedRoute role="driver"><DriverDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin-dashboard"
          element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
        />
      </Routes>
    </Router>
  );
};

// Styles for the Navbar
const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "#ff6f61",
    color: "#fff",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  navLinks: {
    display: "flex",
    gap: "1rem",
  },
  link: {
    textDecoration: "none",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  logoutButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default App;