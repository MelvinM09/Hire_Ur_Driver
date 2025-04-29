import React, { useEffect, useState } from 'react';
import { checkUserRole } from '../services/api'; // Import the API service

const UserProfile = () => {
  const [role, setRole] = useState(null); // Store the user role
  const [loading, setLoading] = useState(true); // Loading state to show a spinner or message

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const data = await checkUserRole(); // Fetch the user role
        setRole(data.role); // Update the role state
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.error('Error fetching user role:', error);
        setLoading(false);
      }
    };

    fetchUserRole(); // Call the function on component mount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading state while fetching
  }

  if (!role) {
    return <div>Error: Role could not be fetched.</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      <p>Your role is: {role}</p>
      {/* Render content based on role */}
      {role === 'admin' ? (
        <div>Welcome, Admin! You can manage users.</div>
      ) : (
        <div>Welcome, User! You can view your profile.</div>
      )}
    </div>
  );
};

export default UserProfile;
