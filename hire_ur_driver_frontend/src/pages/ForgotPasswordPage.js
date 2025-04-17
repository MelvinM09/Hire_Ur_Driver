import React, { useState } from "react";
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

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP and reset password
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle requesting OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/forgot-password`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      setSuccess(response.data.msg);
      setStep(2); // Move to OTP verification and password reset step
    } catch (error) {
      console.error("Forgot password error:", error.response?.data || error.message);
      setError(error.response?.data?.msg || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification and password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/reset-password`,
        { email, otp, newPassword },
        { headers: { "Content-Type": "application/json" } }
      );

      setSuccess(response.data.msg);
      setTimeout(() => {
        navigate("/login");
      }, 1500); // Redirect to login after success
    } catch (error) {
      console.error("Reset password error:", error.response?.data || error.message);
      setError(error.response?.data?.msg || "Invalid OTP or server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h4" gutterBottom>
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </Typography>

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} style={{ width: "100%" }}>
            <TextField
              label="Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              disabled={loading}
              error={!!error}
              helperText={error || "Enter your registered email address"}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : "Send OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ width: "100%" }}>
            <TextField
              label="OTP"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              fullWidth
              margin="normal"
              required
              inputProps={{ maxLength: 6 }}
              disabled={loading}
              error={!!error}
              helperText={error || "Enter the 6-digit OTP sent to your email"}
              sx={{ mb: 2 }}
            />

            <TextField
              label="New Password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              disabled={loading}
              error={!!error}
              helperText={error || "Enter your new password (min 6 characters)"}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
            </Button>
          </form>
        )}

        <Typography variant="body2" color="textSecondary" align="center">
          {step === 1
            ? "Enter your email to receive a password reset OTP."
            : "Didn’t receive the OTP? Check your spam/junk folder or try again."}
        </Typography>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;