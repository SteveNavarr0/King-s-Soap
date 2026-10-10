import { useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import CartElement from "../components/CartElement";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const [total, setTotal] = useState(0);
  const { session, user } = useAuth();
  const location = useLocation();
  const isOverlay = Boolean(location.state?.backgroundLocation);
  const [searchParams] = useSearchParams();
  const isCanceled = searchParams.get("canceled") === "true";
  const [submittingType, setSubmittingType] = useState(null); // 'shipping' | 'pickup'
  const isSubmitting = Boolean(submittingType);
  const [error, setError] = useState(null);

  const handleCheckout = async (checkoutType = "shipping") => {
    // Prevent checkout if there is no active session token
    if (!session?.access_token) {
      setError("You must be logged in to check out.");
      return;
    }

    if (total <= 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmittingType(checkoutType);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          checkoutType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create checkout session.");
      }

      // Redirect to the Stripe hosted checkout page
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL was provided by the server.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message);
    } finally {
      setSubmittingType(null);
    }
  };

  return (
    <div className={`flex flex-col w-full min-h-screen pt-24 md:fixed md:inset-y-0 md:right-0 md:z-[60] md:w-[480px] md:overflow-y-auto md:pt-0 bg-[#C5AE98] ${
      isOverlay
        ? "md:shadow-[0_0_0_100vmax_rgba(0,0,0,0.5)]"
        : ""
    }`}>
      {isOverlay && (
        <button
          type="button"
          aria-label="Close cart"
          onClick={() => window.history.back()}
          className="absolute right-4 top-7 z-10 hidden h-10 w-10 cursor-pointer items-center justify-center text-2xl text-white hover:scale-105 md:flex"
        >
          ×
        </button>
      )}

      <h1 className="px-8 pt-8 font-serif text-3xl text-white">
        Your Cart
      </h1>

      {/* Cart section */}
      <div className="flex-1 px-8 pt-6 overflow-x-auto">
        {isCanceled && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 text-amber-800 rounded-md">
            Your checkout was cancelled. Your items are still saved in your cart.
          </div>
        )}

        <div className="w-full">
          {/* Cart product rows */}
          <CartElement onTotalChange={setTotal} />
        </div>
      </div>

      {/* Checkout section */}
      <div className="w-full shrink-0 px-8 pb-8">
        <div className="flex w-full flex-col items-center">
          {/* Checkout divider */}
          <div className="h-px w-full bg-white/70" />

              <h2 className="mt-6 font-serif text-xl text-white">
            Estimated Total: ${total.toFixed(2)}
          </h2>

          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Shipping and taxes calculated at checkout
          </p>

          {/* Display error message if the fetch fails */}
          {error && (
            <p className="mt-3 text-sm text-red-600 font-semibold">{error}</p>
          )}

          {/* Shipping Checkout Button */}
          <button
            onClick={() => handleCheckout("shipping")}
            disabled={isSubmitting || total <= 0}
            className="mt-6 flex w-5/6 items-center justify-center rounded-lg border border-white/30 bg-white/30 py-2 text-center font-sans text-sm text-gray-800 transition duration-200 cursor-pointer hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 md:text-base"
          >
            {submittingType === "shipping" ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Shipping Checkout"
            )}
          </button>

          {/* Local Pickup Checkout Button */}
          <button 
            onClick={() => handleCheckout("pickup")}
            disabled={isSubmitting || total <= 0}
            className="mt-6 flex w-5/6 items-center justify-center rounded-lg border border-white/30 bg-white py-2 text-center font-sans text-sm text-gray-800 transition duration-200 cursor-pointer hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 md:text-base"
          >
            {submittingType === "pickup" ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Local Pickup Checkout"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;