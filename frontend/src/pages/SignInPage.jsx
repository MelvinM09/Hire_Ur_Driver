import { SignIn, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkUserRole } from "../services/api";

const SignInPage = () => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const redirectBasedOnRole = async () => {
      if (!isSignedIn || !user) return; // Wait until user is signed in
      try {
        const data = await checkUserRole(user.id); // Pass Clerk user ID to API
        if (data.exists) {
          if (data.role === "driver") {
            navigate("/dashboard/driver");
          } else if (data.role === "user") {
            navigate("/dashboard/user");
          } else {
            setError("Invalid role assigned to user.");
          }
        } else {
          setError("User not found in the database.");
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        setError("Failed to verify user. Please try again.");
      }
    };

    redirectBasedOnRole();
  }, [isSignedIn, user, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {error && (
        <div className="absolute top-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <SignIn path="/sign-in" routing="path" />
    </div>
  );
};

export default SignInPage;