import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import supabase from "../supabaseClient";

const getImageUrl = (imagePath) => {
  const { data } = supabase.storage
    .from("Product Images")
    .getPublicUrl(imagePath);

  return data.publicUrl;
};

function CreateAccountElement() {
  const backgroundImage = getImageUrl("images/login-background-image.png");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (password.length < 8 || !hasLetter || !hasNumber) {
      setErrorMessage(
        "Password must be at least 8 characters and include at least 1 letter and 1 number."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          first_name: name.trim(),
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate("/verifyaccount", {
      state: {
        email: trimmedEmail,
      },
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4 py-24 md:py-8">
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
        <form className="space-y-6" onSubmit={handleCreateAccount}>
          <div>
            <label
              htmlFor="signup-name"
              className="mb-2 block font-serif text-lg text-gray-800 md:text-xl"
            >
              First Name
            </label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoComplete="given-name"
              placeholder="Name"
              className="h-12 w-full rounded-lg border border-gray-300 px-4 font-sans text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label
              htmlFor="signup-email"
              className="mb-2 block font-serif text-lg text-gray-800 md:text-xl"
            >
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="user@example.com"
              className="h-12 w-full rounded-lg border border-gray-300 px-4 font-sans text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="mb-2 block font-serif text-lg text-gray-800 md:text-xl"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Password"
                className="h-12 w-full rounded-lg border border-gray-300 px-4 pr-12 font-sans text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 cursor-pointer px-4 text-gray-700"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-confirm-password"
              className="mb-2 block font-serif text-lg text-gray-800 md:text-xl"
            >
              Retype Password
            </label>
            <div className="relative">
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                autoComplete="new-password"
                placeholder="Retype password"
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

          {errorMessage && (
            <p className="font-sans text-base text-red-600">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full cursor-pointer rounded-lg border border-white/30 bg-[#8B6B4A] font-sans text-base text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 md:text-xl"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>

          <Link
            to="/login"
            className="block text-center font-sans text-base text-gray-800 underline decoration-gray-800/30 underline-offset-4 transition hover:scale-101 md:text-lg"
          >
            Log In
          </Link>
        </form>
      </div>
    </div>
  );
}

export default CreateAccountElement;