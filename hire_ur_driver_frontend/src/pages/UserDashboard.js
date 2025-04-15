// src/pages/UserDashboard.js
import React from "react";

const UserDashboard = () => {
  return (
    <div style={styles.container}>
      <h2>User Dashboard</h2>
      <p>Welcome to your dashboard!</p>
      <p>From here, you can book drivers and view your trip history.</p>
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

export default UserDashboard;