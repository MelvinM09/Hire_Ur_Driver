import React from "react";
import { motion } from "framer-motion";

const UserDashboard = () => {
  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.header}
      >
        <h1 style={styles.title}>Welcome, User</h1>
        <p style={styles.subtitle}>Here’s your personalized dashboard.</p>
      </motion.div>

      <div style={styles.cardsContainer}>
        {["My Bookings", "Upcoming Rides", "Past Trips", "Profile Settings"].map((label, index) => (
          <motion.div
            key={index}
            style={styles.card}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <h3>{label}</h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "4rem 2rem",
    fontFamily: "'Poppins', sans-serif",
    background: "#f5f8ff",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  title: {
    fontSize: "2.5rem",
    color: "#333",
    fontWeight: "700",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#666",
  },
  cardsContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "2rem",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.05)",
    width: "250px",
    textAlign: "center",
    fontSize: "1.1rem",
    color: "#4B5EAA",
  },
};

export default UserDashboard;
