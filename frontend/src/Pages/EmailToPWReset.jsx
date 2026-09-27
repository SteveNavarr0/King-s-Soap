import LoginBackgroundImage from "../assets/images/login-background-image/login-background-image.png";
import { NavLink } from "react-router-dom";
import supabase from "../supabaseClient";
import { useState, useEffect } from "react";

function EmailToPWReset() {
  
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

  //tracking if email was sent and cooldown timer
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
setLoading(true); //form is processing
setMessage("");
setErrorMsg("");

    //calls supabase to send the reset password email
    const { data, error } = await supabase.auth.resetPasswordForEmail(email,{
        redirectTo: "http://localhost:5173/UserChangePassword", 
        //redirects user to this page after clicking the link in the email
      });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage(
    isSent ? "Reset email resent. Check your email inbox." : "Reset email sent. Check your email inbox."
      );

    setIsSent(true);
    setCooldown(30); //start 30-second cooldown
    }
      setLoading(false); //form is no longer processing
  };

    //page elements
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Background Image */}
      <img
        src={LoginBackgroundImage}
        alt="Background"
        className="absolute h-full w-full object-cover z-0"
      />

      {/*Email Entry to initiate Password Reset*/}
      <div className="z-20 w-full max-w-md rounded-2xl bg-white px-6 py-8 shadow-lg -mt-40">
        <div className="space-y-6">

          <form class="space-y-6" onSubmit={handleResetPassword}>
                <div>
                    <label class="block text-2xl font-medium text-gray-800 mb-2">
                    Email
                    </label>
                    <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    class="w-full h-12 px-4 rounded-xl border border-gray-300 text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-400"
                    />
                </div>

            
            {/*success / error messages */}
            {message && <p className="text-green-500 text-sm">{message}</p>}
            {errorMsg && <p className="text-red-500">{errorMsg}</p>}

            {/* Change button type to this when we end up handling button */}
            {/* <button type="button" onClick={handleResendEmail}> */}
          <div className="flex gap-4">
            
            <NavLink to="/Login"
              className={({ isActive }) =>
                'flex-1 h-12 rounded-xl border border-zinc-800 text-xl font-medium text-zinc-800 cursor-pointer bg-transparent flex items-center justify-center hover:scale-101 hover:text-[#8B6B4A]'
              }
              >
              Cancel
            </NavLink>

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="flex-1 h-12 rounded-xl bg-zinc-800 text-xl font-medium text-white cursor-pointer"
            >
          {loading
                  ? "Sending..."
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : isSent
                  ? "Resend Email"
                  : "Reset Password"}            
              </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
  }

export default EmailToPWReset;
