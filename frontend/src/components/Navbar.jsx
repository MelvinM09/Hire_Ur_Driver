import React from 'react';
import { Link } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';

const Navbar = () => {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();

  // Determine if the user is authenticated
  const isAuthenticated = isLoaded && !!user;

  const handleLogout = async () => {
    await signOut(); // Clerk's sign-out method
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logoContainer}>
        <Link to="/" style={styles.logo}>
          Hire Ur Driver
        </Link>
      </div>
      <div style={styles.navLinks}>
        <Link to="/" style={styles.link}>
          Home
        </Link>
        <Link to="/sign-up" style={styles.link}>
          Register
        </Link>
        {isAuthenticated ? (
          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/sign-in" style={styles.link}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 5%",
    backgroundImage: "linear-gradient(135deg,rgb(8, 0, 255) 0%,rgb(114, 119, 255) 100%)",
    color: "#fff",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#ffffff",
    textDecoration: "none",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
  },
  link: {
    textDecoration: "none",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "opacity 0.3s ease",
  },
  logoutButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "opacity 0.3s ease",
    padding: "0.3rem 0.5rem",
  },
};

export default Navbar;