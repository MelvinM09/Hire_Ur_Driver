import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <SignIn 
          path="/sign-in" 
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/redirect"
          forceRedirectUrl="/redirect"
        />
      </div>
    </div>
  );
};

export default SignInPage;