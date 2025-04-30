import { useUser, useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RedirectionPage = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;

    const verifyAndRedirect = async () => {
      try {
        console.log("[REDIRECT] Starting verification");
        
        if (!isSignedIn || !user) {
          console.log("[REDIRECT] User not signed in - redirecting to sign-in");
          navigate("/sign-in", { replace: true });
          return;
        }

        console.log("[REDIRECT] Getting token for user:", user.id);
        const token = await getToken({ template: "api", skipCache: true });
        
        if (!token) {
          throw new Error("Failed to obtain authentication token");
        }

        console.log("[REDIRECT] Verifying role with backend");
        const response = await axios.get("http://localhost:5000/api/users/verify-role", {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("[REDIRECT] Backend response:", response.data);

        if (response.data.exists) {
          const dashboardPath = `/dashboard/${response.data.role}`;
          console.log(`[REDIRECT] Redirecting to: ${dashboardPath}`);
          navigate(dashboardPath, { replace: true });
        } else {
          console.log("[REDIRECT] No role assigned - redirecting to role selection");
          navigate("/role-selection", { replace: true });
        }
      } catch (error) {
        console.error("[REDIRECT] Error:", {
          message: error.message,
          response: error.response?.data,
          stack: error.stack
        });
        setError(error.response?.data?.message || error.message);
        navigate("/sign-in", { state: { error: error.message }, replace: true });
      }
    };

    verifyAndRedirect();
  }, [isLoaded, isSignedIn, user, navigate, getToken]);

  // Simple inline loading indicator
  if (!isLoaded || (!error && isSignedIn)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Simple inline error display
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Redirect Error</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => navigate("/sign-in")} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default RedirectionPage;