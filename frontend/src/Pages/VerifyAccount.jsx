import { useLocation } from "react-router-dom";
import { MdOutlineEmail } from "react-icons/md";
import supabase from "../supabaseClient";
import { useState, useEffect } from "react";

const getImageUrl = (imagePath) => {
  const { data } = supabase.storage
    .from("Product Images")
    .getPublicUrl(imagePath);

  return data.publicUrl;
};

function VerifyAccount() {
  const backgroundImage = getImageUrl("images/login-background-image.png");
  const location = useLocation();
  const email = location.state?.email;
  const [counter, setCounter] = useState(0);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
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
    setIsError(false);

      if (counter > 0 || isSending) {
        return;
      }

    if (!email) {
      setIsError(true);
      setMessage("Email address not found. Please create your account again.");
      return;
    }

    setIsSending(true);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    setIsSending(false);

    if (error) {
      setIsError(true);
      setMessage(error.message);
      return;
    }

    setMessage("Verification email sent.");
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
        <div className="space-y-6 text-center">
          <MdOutlineEmail
            className="mx-auto text-6xl text-gray-700"
            aria-hidden="true"
          />

          <div>
            <h1 className="font-serif text-2xl text-gray-800 md:text-3xl">
              Verify Your Account
            </h1>
            <p className="mt-3 font-sans text-base leading-relaxed text-gray-700">
              If this email is eligible, verification instructions were sent
              to your inbox.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResendEmail}
            disabled={isSending || counter > 0}
            className="h-12 w-full cursor-pointer rounded-lg border border-white/30 bg-[#8B6B4A] font-sans text-base text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 md:text-xl"
          >
            {isSending ? "Sending..." : counter > 0 ? `Resend Email in ${counter}s` : "ResendEmail"} 
          </button>

          {message && (
            <p
              role="status"
              className={`font-sans text-base ${
                isError ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyAccount;