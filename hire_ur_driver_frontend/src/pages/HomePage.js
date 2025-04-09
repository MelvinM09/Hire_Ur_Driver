// src/pages/HomePage.js
import React from "react";

const HomePage = () => {
  return (
    <div style={styles.container}>
      <h1>Welcome to Hire Ur Driver</h1>
      <p>Book professional drivers for your own vehicle.</p>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
  },
};

export default HomePage;