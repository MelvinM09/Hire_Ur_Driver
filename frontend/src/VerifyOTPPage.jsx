// src/pages/VerifyOTPPage.jsx
import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const VerifyOTPPage = () => {
  const { signUp, setActive } = useSignUp();
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        navigate("/"); // Redirect after successful verification
      }
    } catch (err) {
      console.error("Error verifying code: ", err.errors[0].message);
    }
  };

  return (
    <div>
      <h2>Verify Email Address</h2>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter OTP code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        /><br/>
        <button type="submit">Verify</button>
      </form>
    </div>
  );
};

export default VerifyOTPPage;
