import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import supabase from "../supabaseClient";

const getImageUrl = (imagePath) => {
  const { data } = supabase.storage
    .from("Product Images")
    .getPublicUrl(imagePath);

  return data.publicUrl;
};

function UserChangePassword() {
  const backgroundImage = getImageUrl("images/login-background-image.png");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Ensure the user arrived through an active reset session.
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

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage(
        "Password changed successfully. You will be redirected to the login page."
      );
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4">
      <img
        src={backgroundImage}
        alt=""
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0 z-0 bg-black/25"
        aria-hidden="true"
      />

      <div className="relative z-20 w-full max-w-md rounded-lg bg-white px-4 py-8 shadow-lg md:px-6">
        <form onSubmit={handleChangePassword} className="space-y-6">
          <h1 className="text-center font-serif text-2xl text-gray-800 md:text-3xl">
            Reset Your Password
          </h1>

          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block font-serif text-lg text-gray-800 md:text-xl"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 w-full rounded-lg border border-gray-300 px-4 pr-12 font-sans text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide new password" : "Show new password"}
                className="absolute inset-y-0 right-0 cursor-pointer px-4 text-gray-700"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block font-serif text-lg text-gray-800 md:text-xl"
            >
              Retype New Password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="New password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 w-full rounded-lg border border-gray-300 px-4 pr-12 font-sans text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((shown) => !shown)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirmation password"
                    : "Show confirmation password"
                }
                className="absolute inset-y-0 right-0 cursor-pointer px-4 text-gray-700"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {message && (
            <p className="font-sans text-base text-green-600">{message}</p>
          )}
          {errorMsg && (
            <p className="font-sans text-base text-red-600">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full cursor-pointer rounded-lg border border-white/30 bg-[#8B6B4A] font-sans text-base text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 md:text-xl"
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>

          <NavLink
            to="/login"
            className="block text-center font-sans text-base text-gray-800 underline decoration-gray-800/30 underline-offset-4 transition hover:scale-101 md:text-lg"
          >
            Cancel
          </NavLink>
        </form>
      </div>
    </div>
  );
}

export default UserChangePassword;