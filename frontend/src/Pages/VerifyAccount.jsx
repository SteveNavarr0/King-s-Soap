import LoginBackgroundImage from "../assets/images/login-background-image/login-background-image.png";
import { MdOutlineEmail } from "react-icons/md";
import supabase from "../supabaseClient";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function VerifyAccount() {
  const location = useLocation();
  const email = location.state?.email;
  const [counter, setCounter] = useState(0);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
useEffect(() => {
    if (counter <= 0) return;

    const timer = setInterval(() => {
      setCounter((prevCounter) => { 
        if (prevCounter <= 1){
          clearInterval(timer);
          return 0;
        }
        return prevCounter - 1;
      });
    }, 1000);

      return () => clearInterval(timer);
    }, [counter > 0]);


  const handleResendEmail = async () => {
    setMessage("");

      if (counter > 0 || isSending) {
        return;
      }

    if (!email) {
      setMessage("Email address not found. Please create your account again.");
      return;
    }

    setIsSending(true);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    setIsSending(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Verification email sent.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Background Image */}
      <img
        src={LoginBackgroundImage}
        alt="Background"
        className="absolute h-full w-full object-cover z-0"
      />

      {/*Account Verification Notifier*/}
      <div className="z-20 w-full max-w-md rounded-2xl bg-white px-6 py-8 shadow-lg -mt-40">
        <div className="space-y-6">
          <div className="flex justify-center">
            <MdOutlineEmail className="text-9xl text-zinc-800" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-medium text-gray-800">
              Verify your account
            </h1>
            <p className="mt-2 text-base text-gray-600">
              If this email is eligible, verification instructions were sent to your inbox.
            </p>
          </div>

          <button
            type="button"
            className="w-full h-12 rounded-xl bg-zinc-800 text-xl font-medium text-white cursor-pointer"
            onClick={handleResendEmail}
            disabled={isSending || counter > 0}
          >
            {isSending ? "Sending..." : counter > 0 ? `Resend Email in ${counter}s` : "ResendEmail"} 
          </button>
          {message && (
            <p className="text-center text-sm font-medium text-green-700">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyAccount;
