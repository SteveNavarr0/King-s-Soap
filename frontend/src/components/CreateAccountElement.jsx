import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import supabase from "../supabaseClient";
const getImageUrl =  (imagePath) => {
    const { data } = supabase.storage
      .from("Product Images")
      .getPublicUrl(imagePath);
      return data.publicUrl;
  };



function CreateAccount() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);


    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const handleCreateAccount = async (event) => {
        event.preventDefault();

        setErrorMessage("");

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
            password: password,
            options: {
                emailRedirectTo: `${window.location.origin}/login`,
            },
        });
console.log("SIGNUP DATA:", data);
console.log("SIGNUP ERROR:", error);
        setIsSubmitting(false);


        if (error) {
            setErrorMessage(error.message);
            return;
        } else {
                setSuccessMessage("Account created. Check your email if verification is sent");

        }

        navigate("/verifyaccount", {
            state: {
                email: trimmedEmail,
            },
        });
};
    
    const LoginBackgroundImage = getImageUrl("images/login-background-image.png");
    return (

        <div className="min-h-screen bg-white flex items-center justify-center">
            {/* Background Image */}
            <img
                src={LoginBackgroundImage}
                alt="Background"
                className="absolute w-full h-full object-cover z-0"
            />
            {/*Create Account Form*/}
            <div className="w-full max-w-md px-6 py-8 bg-white rounded-2xl shadow-lg -mt-20 z-20">
                <form className="space-y-6" onSubmit={handleCreateAccount}>
                <div>
                    <label className="block text-2xl font-medium text-gray-800 mb-2">
                    Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"
                        autoComplete="email"
                        placeholder="user@example.com"
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
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="********"
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-400"
                        />
                </div>

                <div>
                    <label className="block text-2xl font-medium text-gray-800 mb-2">
                    Re-enter password
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                        placeholder="********"
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-400"
                        />
                </div>

                {errorMessage && (
                    <p className="text-sm font-medium text-red-600">
                        {errorMessage}
                    </p>
                )}
                <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full h-12 rounded-xl bg-zinc-800 text-white text-xl font-medium cursor-pointer"
                >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                </button>
               

                <div className="space-y-5 pt-2">
                    <Link to="/login" className="inline-block text-2xl text-gray-800 underline underline-offset-4">
                    Login
                    
                    </Link>

                </div>
                </form>
            </div>
        </div>
    
    );
}

export default CreateAccount;