import React from "react";
import { motion } from "framer-motion";

const HomePage = () => {
  const features = [
    {
      title: "Professional Drivers",
      description: "Our drivers are highly trained, background-checked, and experienced.",
      icon: "🚗"
    },
    {
      title: "Convenience",
      description: "Easy booking process with real-time tracking and 24/7 availability.",
      icon: "⏱️"
    },
    {
      title: "Affordable Rates",
      description: "Competitive pricing with no hidden fees and flexible packages.",
      icon: "💰"
    },
    {
      title: "Safety First",
      description: "All drivers follow strict safety protocols for your peace of mind.",
      icon: "🛡️"
    }
  ];

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <motion.div 
        style={styles.heroSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div style={styles.heroOverlay}></div>
        <motion.div 
          style={styles.heroContent}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 style={styles.heroTitle}>Welcome to Hire Ur Driver</h1>
          <p style={styles.heroSubtitle}>
            Book professional drivers for your own vehicle anytime, anywhere
          </p>
          <motion.button 
            style={styles.ctaButton}
            whileHover={{ scale: 1.05, backgroundColor: "#ff6f61", color: "#fff" }}
            whileTap={{ scale: 0.95 }}
          >
            Book Now
          </motion.button>
        </motion.div>
        
        <motion.div 
          style={styles.scrollIndicator}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <span style={styles.scrollText}>Scroll Down</span>
          <div style={styles.arrowDown}></div>
        </motion.div>
      </motion.div>

      {/* Features Section with Image Background */}
      <div style={styles.featuresSection}>
        <div style={styles.featuresImageOverlay}></div>
        <div style={styles.featuresContent}>
          <motion.h2 
            style={styles.sectionTitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Why Choose Us?
          </motion.h2>
          
          <div style={styles.featureCardsContainer}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                style={styles.featureCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)" }}
              >
                <div style={styles.featureIcon}>{feature.icon}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div style={styles.testimonialsSection}>
        <motion.h2 
          style={styles.sectionTitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          What Our Customers Say
        </motion.h2>
        
        <div style={styles.testimonialsContainer}>
          <motion.div
            style={styles.testimonialCard}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p style={styles.testimonialText}>"The driver was punctual and professional. Will definitely use again!"</p>
            <div style={styles.testimonialAuthor}>- Sarah J.</div>
          </motion.div>
          
          <motion.div
            style={styles.testimonialCard}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p style={styles.testimonialText}>"Great service at an affordable price. Highly recommended!"</p>
            <div style={styles.testimonialAuthor}>- Michael T.</div>
          </motion.div>
          
          <motion.div
            style={styles.testimonialCard}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p style={styles.testimonialText}>"Perfect solution for when I need a driver for my car."</p>
            <div style={styles.testimonialAuthor}>- Emily R.</div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.ctaSection}>
        <motion.div
          style={styles.ctaContent}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 style={styles.ctaTitle}>Ready to Experience Premium Driving Service?</h2>
          <motion.button 
            style={styles.ctaButtonSecondary}
            whileHover={{ scale: 1.05, backgroundColor: "#fff", color: "#ff6f61" }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  heroSection: {
    position: "relative",
    backgroundImage: "url('https://www.pixelstalk.net/wp-content/uploads/image12/Car-Desktop-Wallpaper-with-a-classic-1965-Ford-Mustang-Coupe-in-royal-blue.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    textAlign: "center",
    padding: "0 20px",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "800px",
  },
  heroTitle: {
    fontSize: "3.5rem",
    fontWeight: "700",
    marginBottom: "1.5rem",
    lineHeight: "1.2",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
  },
  heroSubtitle: {
    fontSize: "1.5rem",
    marginBottom: "3rem",
    fontWeight: "300",
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
  },
  ctaButton: {
    backgroundColor: "#fff",
    color: "#ff6f61",
    border: "none",
    padding: "1rem 2.5rem",
    fontSize: "1.2rem",
    borderRadius: "50px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  },
  ctaButtonSecondary: {
    backgroundColor: "#ff6f61",
    color: "#fff",
    border: "none",
    padding: "1rem 2.5rem",
    fontSize: "1.2rem",
    borderRadius: "50px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    marginTop: "2rem",
  },
  scrollIndicator: {
    position: "absolute",
    bottom: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1,
  },
  scrollText: {
    fontSize: "0.9rem",
    marginBottom: "10px",
    opacity: "0.8",
  },
  arrowDown: {
    width: "20px",
    height: "20px",
    borderLeft: "2px solid #fff",
    borderBottom: "2px solid #fff",
    transform: "rotate(-45deg)",
    opacity: "0.8",
  },
  featuresSection: {
    position: "relative",
    padding: "6rem 2rem",
    backgroundImage: "url('https://www.pixelstalk.net/wp-content/uploads/image12/Car-Desktop-Wallpaper-with-a-classic-1965-Ford-Mustang-Coupe-in-royal-blue.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    textAlign: "center",
  },
  featuresImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  featuresContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "3rem",
    color: "#333",
  },
  featureCardsContainer: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  featureCard: {
    backgroundColor: "#fff",
    padding: "2.5rem 2rem",
    borderRadius: "15px",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
    width: "280px",
    transition: "all 0.3s ease",
  },
  featureIcon: {
    fontSize: "2.5rem",
    marginBottom: "1.5rem",
  },
  featureTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    marginBottom: "1rem",
    color: "#333",
  },
  featureDescription: {
    fontSize: "1rem",
    color: "#4B5EAA",
    lineHeight: "1.6",
  },
  testimonialsSection: {
    position: "relative",
    padding: "6rem 2rem",
    backgroundImage: "url('https://www.pixelstalk.net/wp-content/uploads/image12/Car-Desktop-Wallpaper-with-a-classic-1965-Ford-Mustang-Coupe-in-royal-blue.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    textAlign: "center",
    textcolor: "dark black",
  },
  testimonialsContainer: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  testimonialCard: {
    backgroundColor: "#E8EEFF",
    padding: "2rem",
    borderRadius: "15px",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
    width: "350px",
    transition: "all 0.3s ease",
  },
  testimonialText: {
    fontSize: "1.1rem",
    color: "#4B5EAA",
    lineHeight: "1.6",
    fontStyle: "italic",
    marginBottom: "1.5rem",
  },
  testimonialAuthor: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#ff6f61",
  },
  ctaSection: {
    padding: "0.5rem 2rem",
    backgroundImage: "linear-gradient(135deg,rgb(8, 0, 255) 0%,rgb(114, 119, 255) 100%)",
    color: "#fff",
    textAlign: "center",
  },
  ctaContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  ctaTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "1.5rem",
    lineHeight: "1.3",
  },
};

export default HomePage;