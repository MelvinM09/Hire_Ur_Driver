import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const RoleSelectionPage = () => {
  const { user: clerkUser, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  // Debug: Log Clerk user info
  useEffect(() => {
    if (clerkUser) {
      console.log("Clerk User Data:", {
        id: clerkUser.id,
        emails: clerkUser.emailAddresses,
        primaryEmail: clerkUser.primaryEmailAddress?.emailAddress
      });
      setDebugInfo(`User ID: ${clerkUser.id} | Email: ${clerkUser.primaryEmailAddress?.emailAddress || "Not found"}`);
    }
  }, [clerkUser]);

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }
  
    setIsLoading(true);
    setError("");
  
    try {
      // Get token with the updated template
      const token = await getToken({ 
        template: "api",
        skipCache: true // Ensure fresh token
      });
  
      // Client-side verification (for debugging only)
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.email) {
        throw new Error("Email missing in token - template needs update");
      }
  
      const response = await axios.post(
        "http://localhost:5000/api/users/update-role",
        { role: selectedRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.data?.success) {
        navigate(`/dashboard/${selectedRole}`);
      } else {
        throw new Error(response.data?.message || "Role update failed");
      }
    } catch (err) {
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        token: err.config?.headers?.Authorization?.substring(0, 20)
      });
  
      setError(
        err.message.includes("Email missing") 
          ? "System configuration error - please contact support"
          : err.response?.data?.message || "Failed to update role"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <h2 style={styles.title}>Select Your Role</h2>
        
        {/* Debug information (remove in production) */}
        {process.env.NODE_ENV === "development" && (
          <div style={styles.debugContainer}>
            <p style={styles.debugText}>{debugInfo}</p>
          </div>
        )}

        {error && (
          <div style={styles.errorContainer}>
            {error}
            <button 
              style={styles.refreshButton}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        )}

        <div style={styles.buttonContainer}>
          <button
            style={{
              ...styles.button,
              ...(selectedRole === "user" && styles.selectedUserButton),
              ...(isLoading && styles.disabledButton)
            }}
            onClick={() => setSelectedRole("user")}
            disabled={isLoading}
          >
            User
          </button>
          <button
            style={{
              ...styles.button,
              ...(selectedRole === "driver" && styles.selectedDriverButton),
              ...(isLoading && styles.disabledButton)
            }}
            onClick={() => setSelectedRole("driver")}
            disabled={isLoading}
          >
            Driver
          </button>
        </div>
        
        <button 
          style={{
            ...styles.continueButton,
            ...(isLoading && styles.loadingButton)
          }} 
          onClick={handleRoleSelection}
          disabled={!selectedRole || isLoading}
        >
          {isLoading ? "Processing..." : "Continue"}
        </button>
      </div>
    </div>
  );
};

// Enhanced styles with debug and loading states
const styles = {
  container: {
    minHeight: "calc(100vh - 64px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: "20px",
  },
  innerContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "500px",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
    color: "#333",
    textAlign: "center",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "2rem",
  },
  button: {
    padding: "1rem 1.5rem",
    borderRadius: "8px",
    border: "2px solid #e5e7eb",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: "120px",
    textAlign: "center",
  },
  selectedUserButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderColor: "#3b82f6",
  },
  selectedDriverButton: {
    backgroundColor: "#22c55e",
    color: "white",
    borderColor: "#22c55e",
  },
  disabledButton: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  continueButton: {
    backgroundColor: "#000",
    color: "white",
    padding: "1rem",
    borderRadius: "8px",
    border: "none",
    fontSize: "1rem",
    fontWeight: "600",
    width: "100%",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  loadingButton: {
    opacity: 0.8,
    cursor: "wait",
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  refreshButton: {
    display: "block",
    margin: "0.5rem auto 0",
    background: "none",
    border: "none",
    color: "#3b82f6",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  debugContainer: {
    backgroundColor: "#eef2ff",
    padding: "0.75rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    fontSize: "0.8rem",
    color: "#4f46e5",
  },
  debugText: {
    margin: "0",
    wordBreak: "break-all",
  },
};

export default RoleSelectionPage;