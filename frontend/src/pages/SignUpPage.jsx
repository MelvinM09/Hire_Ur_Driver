// src/pages/SignUpPage.jsx
import { useEffect } from "react";
import { SignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to RoleSelectionPage after successful sign-up
    // SignUpPage will be handled by Clerk itself
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>

      {/* Clerk's SignUp form */}
      <div className="w-full max-w-md">
        <SignUp
          path="/sign-up"
          routing="path"
          redirectUrl="/role-selection" // Redirect after signup to the Role Selection page
        />
      </div>
    </div>
  );
};

export default SignUpPage;
