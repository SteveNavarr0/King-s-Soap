import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import CartElement from "../components/CartElement";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const [total, setTotal] = useState(0);
  const { session, user } = useAuth();
  const [searchParams] = useSearchParams();
  const isCanceled = searchParams.get("canceled") === "true";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    // Prevent checkout if there is no active session token
    if (!session?.access_token) {
      setError("You must be logged in to check out.");
      return;
    }

    if (total <= 0) {
      setError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create checkout session.");
      }

      // Redirect to the Stripe hosted checkout page
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      {/* White cart section */}
      <div className="flex-1 bg-white px-8 py-8 overflow-x-auto">
        {isCanceled && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 text-amber-800 rounded-md">
            Your checkout was cancelled. Your items are still saved in your cart.
          </div>
        )}

        <div className="min-w-[700px]">
          {/* Cart headings */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-x-8 items-center pb-4 text-sm text-gray-500">
            <span>Product</span>
            <span className="text-center">Price</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Total</span>
          </div>

          {/* Cart product rows */}
          <CartElement onTotalChange={setTotal} />
        </div>
      </div>

      {/* Brown checkout section */}
      <div className="w-full lg:w-1/4 lg:min-h-screen shrink-0 bg-[#cbb49d] px-6 py-8">
        <div className="flex w-full flex-col items-start">
          {/* Black line */}
          <div className="h-1 bg-black w-5/6" />

          <h2 className="mt-6 font-bold text-base sm:text-lg md:text-xl text-black">
            Estimated Total: ${total.toFixed(2)}
          </h2>

          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Shipping and taxes calculated at checkout
          </p>

          {/* Display error message if the fetch fails */}
          {error && (
            <p className="mt-3 text-sm text-red-600 font-semibold">{error}</p>
          )}

          {/* Dynamic Checkout Button */}
          <button 
            onClick={handleCheckout}
            disabled={isSubmitting || total <= 0}
            className="mt-7 py-2 bg-black text-center text-white border-black w-5/6 rounded flex justify-center items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Checkout"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;