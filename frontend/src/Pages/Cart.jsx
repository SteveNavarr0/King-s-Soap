import PaymentSuccessful from "../Pages/PaymentSuccessful";
import { Link } from "react-router-dom";

const total = 0; //Will use later for calculating total
const price = 0;
const quantity = 0;
const product ="";

const Cart = () => {
  return (
   //The text in the white box
     <div className="flex w-full max-w-10xl gap-6"> 
  <div className="min-h-screen bg-white flex flex-col w-4/6 text-gray-600">
   <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] px-8 py-4">
  <span>Product</span>
  <span className="text-center-6">Price</span>
  <span className="text-center-6">Qty</span>
  <span className="text-right-1">Total</span>
</div>
      </div>

 {/*The text in the brown box */}
      <div className="w-1/4 min-h-screen px-3 sm:px-4 md:px-6">
        <div className="w-full flex flex-col items-start"> {/*Adjust everything to the start*/}
          <div className="h-1 bg-black w-5/6 mt-8"></div> {/*The black line*/}

          <h2 className="mt-6 text-left py-1 font-bold font-sans text-base sm:text-lg md:text-xl">
            Estimated Total: ${total.toFixed(2)}
          </h2>

          <p className="text-left text-xs sm:text-sm text-gray-500 m-0">
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