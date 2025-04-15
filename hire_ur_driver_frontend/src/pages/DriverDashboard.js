// src/pages/DriverDashboard.js
import React from "react";

const DriverDashboard = () => {
  return (
    <div style={styles.container}>
      <h2>Driver Dashboard</h2>
      <p>Welcome, Driver!</p>
      <p>View your upcoming bookings and toggle your availability.</p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
};

export default DriverDashboard;