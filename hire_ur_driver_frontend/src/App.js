import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboard from "./pages/UserDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import VerifyOTPPage from "./pages/VerifyOTPPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage"; // Import the new page

const App = () => {
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  const updateRole = () => {
    const newRole = localStorage.getItem("role") || null;
    console.log("Updating role to:", newRole);
    setRole(newRole);
  };

  useEffect(() => {
    window.addEventListener("storage", updateRole);
    return () => {
      window.removeEventListener("storage", updateRole);
    };
  }, []);

  const ProtectedRoute = ({ role: requiredRole, children }) => {
    console.log("Current Role:", role, "Required Role:", requiredRole);
    return role === requiredRole ? children : <Navigate to="/login" replace />;
  };

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
              updateRole();
              window.location.href = "/";
            }}
            style={styles.logoutButton}
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/forgot-password" style={styles.link}>Forgot Password</Link> {/* New link */}
          </>
        )}
      </div>
    </nav>
  );

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage updateRole={updateRole} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* New route */}
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

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundImage: "linear-gradient(135deg, rgb(118, 97, 255) 0%, rgb(2, 5, 88) 100%)",
    color: "#fff",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
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