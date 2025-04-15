import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress
} from "@mui/material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; // Configurable API URL

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // Countdown in seconds
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  // Redirect to register if no email in localStorage
  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  // Handle resend cooldown countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer); // Cleanup on unmount or update
    }
  }, [resendCooldown]);

  // Handle OTP verification
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/verify-otp`,
        { otp, email },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setSuccess("OTP verified successfully!");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);

        setTimeout(() => {
          const roleRedirects = {
            user: "/user-dashboard",
            driver: "/driver-dashboard",
            admin: "/admin-dashboard",
          };
          navigate(roleRedirects[response.data.role] || "/"); // Default to home if role unknown
        }, 1500); // Increased delay for better UX
      } else {
        setError("Unexpected response from server.");
      }
    } catch (error) {
      console.error("OTP verification error:", error.response?.data || error.message);
      setError(
        error.response?.data?.msg || "Invalid OTP. Please try again or resend a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle resending OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/resend-otp`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.msg === "New OTP sent to your email. Please verify.") {
        setSuccess("New OTP sent to your email!");
        setResendCooldown(60); // Start 60-second countdown
      } else {
        setError("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error.response?.data || error.message);
      setError("Failed to resend OTP. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h4" gutterBottom>
          Verify OTP
        </Typography>

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleVerify} style={{ width: "100%" }}>
          <TextField
            label="OTP"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // Only allow digits
            fullWidth
            margin="normal"
            required
            inputProps={{ maxLength: 6 }}
            disabled={loading}
            error={!!error}
            helperText={error || "Enter the 6-digit OTP sent to your email"}
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 1, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Verify OTP"}
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={handleResendOTP}
            disabled={resendCooldown > 0 || loading}
            sx={{ mb: 2 }}
          >
            {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : "Resend OTP"}
          </Button>
        </form>

        <Typography variant="body2" color="textSecondary" align="center">
          Didn’t receive the OTP? Check your spam/junk folder or click "Resend OTP".
        </Typography>
      </Box>
    </Container>
  );
};

export default VerifyOTPPage;