import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import supabase from "../supabaseClient";

const getImageUrl = (imagePath) => {
  const { data } = supabase.storage
    .from("Product Images")
    .getPublicUrl(imagePath);

  return data.publicUrl;
};

function EmailToPWReset() {
  const backgroundImage = getImageUrl("images/login-background-image.png");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;

    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/UserChangePassword",
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage(
        isSent
          ? "Reset email resent. Check your email inbox."
          : "Reset email sent. Check your email inbox."
      );
      setIsSent(true);
      setCooldown(30);
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
        <form className="space-y-6" onSubmit={handleResetPassword}>
          <h1 className="text-center font-serif text-2xl text-gray-800 md:text-3xl">
            Reset Your Password
          </h1>

          <div>
            <label
              htmlFor="reset-email"
              className="mb-2 block font-serif text-lg text-gray-800 md:text-xl"
            >
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 w-full rounded-lg border border-gray-300 px-4 font-sans text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {message && (
            <p className="font-sans text-base text-green-600">{message}</p>
          )}
          {errorMsg && (
            <p className="font-sans text-base text-red-600">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="h-12 w-full cursor-pointer rounded-lg border border-white/30 bg-[#8B6B4A] font-sans text-base text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 md:text-xl"
          >
            {loading
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : isSent
                  ? "Resend Email"
                  : "Reset Password"}
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

export default EmailToPWReset;