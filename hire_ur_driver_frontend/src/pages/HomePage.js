// src/pages/HomePage.js
import React from "react";

const HomePage = () => {
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <h1 style={styles.heroTitle}>Welcome to Hire Ur Driver</h1>
        <p style={styles.heroSubtitle}>
          Book professional drivers for your own vehicle.
        </p>
        <button style={styles.ctaButton}>Book Now</button>
      </div>

      {/* Features Section */}
      <div style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>Why Choose Us?</h2>
        <div style={styles.featureCardsContainer}>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>Professional Drivers</h3>
            <p style={styles.featureDescription}>
              Our drivers are highly trained and experienced.
            </p>
          </div>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>Convenience</h3>
            <p style={styles.featureDescription}>
              Easy booking process tailored for you.
            </p>
          </div>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>Affordable Rates</h3>
            <p style={styles.featureDescription}>
              Competitive pricing for all your needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Arial', sans-serif",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  },
  heroSection: {
    backgroundImage: "url('https://info.drivedifferent.com/hubfs/SMI-BLOG-Ways-to-Improve-Drivers-Happiness%20%281%29.jpg')", // Replace with your image URL
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "calc(100vh - 60px)", // Adjust for navbar height
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    textAlign: "center",
  },
  heroTitle: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  heroSubtitle: {
    fontSize: "1.5rem",
    marginBottom: "2rem",
  },
  ctaButton: {
    backgroundColor: "#fff",
    color: "#ff6f61",
    border: "none",
    padding: "1rem 2rem",
    fontSize: "1.2rem",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  featuresSection: {
    padding: "4rem 2rem",
    backgroundColor: "#f9f9f9",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "2rem",
  },
  featureCardsContainer: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "2rem",
  },
  featureCard: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    width: "300px",
    transition: "transform 0.3s ease",
  },
  featureTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  featureDescription: {
    fontSize: "1rem",
    color: "#555",
  },
};

export default HomePage;