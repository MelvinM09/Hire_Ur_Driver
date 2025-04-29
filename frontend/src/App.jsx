import React from "react";
import { Routes, Route } from "react-router-dom";

// Clerk
import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from "@clerk/clerk-react";

// Pages
import HomePage from "./pages/HomePage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import UserProfile from './pages/UserProfile.jsx';


// Components
import Navbar from "./components/Navbar.jsx";

const App = () => {
  return (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/role-selection" element={<RoleSelectionPage />} />
        <Route path="/profile" component={UserProfile} />



        {/* Protected routes */}
        <Route
          path="/dashboard/user"
          element={
            <>
              <SignedIn>
                <UserDashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <>
              <SignedIn>
                <AdminDashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/dashboard/driver"
          element={
            <>
              <SignedIn>
                <DriverDashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
