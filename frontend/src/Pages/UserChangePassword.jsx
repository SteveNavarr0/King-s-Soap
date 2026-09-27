import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import LoginBackgroundImage from "../assets/images/login-background-image/login-background-image.png";
import supabase from "../supabaseClient";

function UserChangePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Guard check: ensure user arrived via a valid recovery link
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setErrorMsg(
          "No active reset session found. Please click the reset link from your email."
        );
      }
    });
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setMessage("");

    if (password !== confirmPassword) { //for password mismatch
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage(
        "Password changed successfully. You will be redirected to the login page."
      );
      setPassword("");
      setConfirmPassword("");

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-start justify-center">
      {/* Background Image */}
      <img
        src={LoginBackgroundImage}
        alt="Background"
        className="absolute w-full h-full object-cover z-0"
      />

      {/* Form Container */}
      <div className="w-full max-w-md bg-white p-6 pb-12 rounded-2xl shadow-sm mt-20 z-10">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
            Reset Your Password
          </h2>

          <div>
            <label className="block text-sm text-gray-800 mb-2">
              New Password
            </label>
            <input
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-800 mb-2">
              Re-Type New Password
            </label>
            <input
              placeholder="New password again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              type="password"
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* feedback messages */}
          {message && <p className="text-green-500 text-sm">{message}</p>}
          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

          {/* Action Buttons */}
          <div className="space-y-2 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-800 text-white py-2 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Changing Password..." : "Change Password"}
            </button>

            {/* Cancel Button */}
            <NavLink
              to="/Login"
              className="w-full block text-center bg-white border border-zinc-800 text-zinc-800 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Cancel
            </NavLink>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserChangePassword;