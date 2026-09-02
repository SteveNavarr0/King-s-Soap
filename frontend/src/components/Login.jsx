import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import supabase from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";

const getImageUrl = (imagePath) => {
  const { data } = supabase.storage
    .from("Product Images")
    .getPublicUrl(imagePath);
  return data.publicUrl;
};

function HomeLogin() {
  const backgroundImage = getImageUrl("images/login-background-image.png");
  const { signInUser } = UserAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const { error } = await signInUser(email, password);

    if (error) {
      setErrorMessage(error.message);
    } else {
      navigate("/Admin");
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center">
      <img
        src={backgroundImage}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="relative w-full max-w-md px-6 py-8 bg-white rounded-2xl shadow-lg z-20">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-2xl font-medium text-gray-800 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full h-12 px-4 rounded-xl border border-gray-300 text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-2xl font-medium text-gray-800 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-12 px-4 rounded-xl border border-gray-300 text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {errorMessage && (
            <p className="text-red-600 text-sm">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-zinc-800 text-white text-xl font-medium"
          >
            User Login
          </button>

          <div className="space-y-5 pt-2">
            <NavLink
              to="/EmailToPWReset"
              className="block text-2xl text-gray-800 underline underline-offset-4 hover:scale-101"
            >
              Forgot Password?
            </NavLink>

            <Link
              to="/createaccount"
              className="inline-block text-2xl text-gray-800 underline underline-offset-4 hover:scale-101"
            >
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HomeLogin;