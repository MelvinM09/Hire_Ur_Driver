import React from "react";
import { motion } from "framer-motion";

const DriverDashboard = () => {
  return (
    <div style={styles.container}>
      <motion.div
        style={styles.header}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={styles.title}>Driver Dashboard</h1>
        <p style={styles.subtitle}>Track your rides and performance metrics.</p>
      </motion.div>

      <div style={styles.cardsContainer}>
        {[
          { label: "Today's Rides", value: "--" },
          { label: "Total Earnings", value: "₹ --" },
          { label: "Average Rating", value: "-- / 5" },
          { label: "Availability Status", value: "Online" },
        ].map((item, index) => (
          <motion.div
            key={index}
            style={styles.card}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <h3 style={styles.cardTitle}>{item.label}</h3>
            <p style={styles.cardValue}>{item.value}</p>
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
    background: "#f3fff9",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  title: {
    fontSize: "2.5rem",
    color: "#1A936F",
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
    background: "#ffffff",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.05)",
    width: "250px",
    textAlign: "center",
  },
  cardTitle: {
    fontSize: "1.2rem",
    marginBottom: "1rem",
    color: "#444",
  },
  cardValue: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1A936F",
  },
};

export default DriverDashboard;
