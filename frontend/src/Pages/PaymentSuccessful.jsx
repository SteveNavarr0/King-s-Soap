import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { BsCheckCircle } from "react-icons/bs";
import supabase from "../supabaseClient";


const PaymentSuccessful = () => {
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!sessionId) {
        setError("Unable to find checkout session.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            product_id,
            products (
              name
            )
          )
        `)
        .eq("stripe_session_id", sessionId)
        .single();

      if (error) {
        console.error("Error fetching order:", error);
        setError("Unable to load your order.");
        setLoading(false);
        return;
      }

      setOrder(data);
      setLoading(false);
    };

    fetchOrder();
  }, [sessionId]);

  // Add together the quantities of all products
  const totalQuantity =
    order?.order_items?.reduce(
      (total, item) => total + item.quantity,
      0
    ) || 0;

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center text-white">
        Loading your order...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center text-white gap-4">
        <p className="text-lg">{error || "Order not found."}</p>
        <Link
          to="/"
          className="bg-white/40 text-white px-4 py-2 rounded-md text-sm hover:bg-white/50 transition"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] flex justify-center items-start pt-10 px-6">

      <div className="w-full max-w-[820px] min-h-[500px] border border-white/40 rounded-lg flex flex-col items-center px-8 py-10">

        {/* Success Icon */}
        <BsCheckCircle className="text-white text-4xl mb-4" />

        {/* Title */}
        <h1 className="text-4xl md:text-5xl text-white font-bold">
          Payment Successful!
        </h1>

        {/* Confirmation */}
        <p className="text-white mt-2">
          Thank you for your purchase!
        </p>

        <p className="text-white text-sm">
          An order confirmation has been sent to {order.customer_email}
        </p>

        {/* Order Summary */}
        <h2 className="text-white text-2xl font-semibold mt-8 mb-5">
          Order Summary
        </h2>

        <div className="bg-white/30 w-full max-w-[520px] px-6 py-8">

          <div className="grid grid-cols-2 gap-y-8 text-white text-sm">

            {/* Quantity */}
            <p>Quantity:</p>
            <p>{totalQuantity}</p>

            {/* Items */}
            <p>Items:</p>

            <div>
              {order.order_items?.map((item) => (
                <p key={item.id}>
                  {item.products?.name} x{item.quantity}
                </p>
              ))}
            </div>

            {/* Total */}
            <p>Total:</p>
            <p>
              ${Number(order.total_amount).toFixed(2)}
            </p>

          </div>

        </div>

        <Link
          to="/orders"
          className="mt-9 bg-white/40 text-white px-4 py-3 rounded-md text-sm hover:bg-white/50 transition"
        >
          View My Orders
        </Link>

      </div>
    </div>
  );
};

export default PaymentSuccessful;


  {/* Old Page
    return (
  <div style={{ width: "100%", height: "100%" }}>
    <h1 className="text-4xl text-[#FFFFFF] font-[Inria_Serif] pl-11 pt-8">PaymentSuccessful</h1>
  </div>
    
  );
  */}
