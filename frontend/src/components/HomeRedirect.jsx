// src/components/HomeRedirect.jsx
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const HomeRedirect = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Check the role stored in the database and redirect
    if (user?.role === "driver") {
      navigate("/dashboard/driver");
    } else {
      navigate("/dashboard/user");
    }
  }, [user, isLoaded, navigate]);

  return null; // This will render nothing while redirecting
};

export default HomeRedirect;
