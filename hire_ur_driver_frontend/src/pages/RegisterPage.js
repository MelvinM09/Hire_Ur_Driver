import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Select,
  MenuItem,
  Alert
} from "@mui/material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.msg === "OTP sent to your email") {
        localStorage.setItem("email", formData.email);
        navigate("/verify-otp");
      } else {
        setError("Unexpected response from server: " + response.data.msg);
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      const errorMsg =
        error.response?.data?.msg ||
        error.response?.data?.errors?.map(e => e.msg).join(", ") ||
        error.message ||
        "Registration failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h4" gutterBottom>
          Register
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2, width: "100%" }}>{error}</Alert>}
        <form onSubmit={handleRegister} style={{ width: "100%" }}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            helperText="Password must be at least 6 characters"
          />
          <Select
            name="role"
            value={formData.role}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="driver">Driver</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default RegisterPage;