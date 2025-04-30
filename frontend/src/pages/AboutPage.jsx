import React from "react";
import { motion } from "framer-motion";

const AboutPage = () => {
  return (
    <div style={styles.container}>
      <motion.div
        style={styles.header}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 style={styles.title}>About Hire Ur Driver</h1>
        <p style={styles.subtitle}>
          Our mission is to make driver booking safer, faster, and more reliable.
        </p>
      </motion.div>

      <motion.div
        style={styles.section}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.7 }}
      >
        <h2 style={styles.sectionTitle}>Who We Are</h2>
        <p style={styles.text}>
          Hire Ur Driver is built to connect vehicle owners with verified, professional drivers who can help you travel stress-free — whether it’s for daily commutes, long drives, or urgent errands.
        </p>
      </motion.div>

      <motion.div
        style={styles.section}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.7 }}
      >
        <h2 style={styles.sectionTitle}>Our Vision</h2>
        <p style={styles.text}>
          We envision a platform where owning a vehicle no longer means you always have to drive. With flexible options and trusted drivers, we’re building freedom for commuters.
        </p>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    padding: "4rem 2rem",
    background: "linear-gradient(to right, #e0eafc, #cfdef3)",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "700",
    color: "#333",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#555",
  },
  section: {
    maxWidth: "900px",
    margin: "2rem auto",
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: "2rem",
    color: "#4B5EAA",
    marginBottom: "1rem",
  },
  text: {
    fontSize: "1.1rem",
    color: "#555",
    lineHeight: "1.6",
  },
};

export default AboutPage;
