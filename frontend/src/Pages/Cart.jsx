import PaymentSuccessful from "../Pages/PaymentSuccessful";
import { useState } from "react";
import { Link } from "react-router-dom";
import CartElement from "../components/CartElement";

const Cart = () => {
  const [total, setTotal] = useState(0);

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      {/* White cart section */}
      <div className="flex-1 bg-white px-8 py-8 overflow-x-auto">
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


          <Link to="/PaymentSuccessful" className="mt-7 py-2 bg-black text-center text-white border-black w-5/6 rounded">
          Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;