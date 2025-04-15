import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box, Alert } from "@mui/material";

const LoginPage = ({ updateRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      console.log("Login Response:", response.data); // Log the API response

      const { token, role } = response.data;

      if (!token || !role) {
        throw new Error("Invalid response from server. Missing token or role.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // Call updateRole to notify App.js about the login
      if (updateRole) {
        console.log("Calling updateRole...");
        updateRole();
      }

      // Redirect based on role
      if (role === "user") {
        console.log("Redirecting to /user-dashboard");
        navigate("/user-dashboard");
      } else if (role === "driver") {
        console.log("Redirecting to /driver-dashboard");
        navigate("/driver-dashboard");
      } else if (role === "admin") {
        console.log("Redirecting to /admin-dashboard");
        navigate("/admin-dashboard");
      }
    } catch (error) {
      console.error("Login failed", error.response?.data || error.message);
      setError(
        error.response?.data?.msg || "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default LoginPage;