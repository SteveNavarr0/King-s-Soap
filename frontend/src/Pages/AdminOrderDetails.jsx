import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminNav from "../components/AdminNav";
import supabase from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

function AdminOrderDetails() {
  // Get the order ID from /adminOrders/:id
  const { id } = useParams();

  // Get the logged-in user's access token
  const { session } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] =
    useState(false);
  const [error, setError] = useState("");

  // Load the selected order
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } =
        await supabase
          .from("active_orders")
          .select("*")
          .eq("order_id", id)
          .single();

      if (fetchError) {
        console.error(
          "Error fetching order:",
          fetchError
        );

        setError("Could not load this order.");
        setLoading(false);
        return;
      }

      setOrder(data);
      setLoading(false);
    };

    fetchOrder();
  }, [id]);

  // Accept or decline an order through the backend
  const handleOrderAction = async (action) => {
    if (!order || order.status !== "on_hold") {
      setError(
        "This order is no longer awaiting approval."
      );
      return;
    }

    if (!session?.access_token) {
      setError(
        "You must be logged in to update an order."
      );
      return;
    }

    if (
      action === "decline" &&
      !window.confirm(
        "Are you sure you want to decline this order?"
      )
    ) {
      return;
    }

    setUpdatingStatus(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/checkout/orders/${order.order_id}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Could not update the order."
        );
      }

      // Update the page with the backend response
      setOrder((currentOrder) => ({
        ...currentOrder,
        status: result.status,
        tracking_number:
          result.trackingNumber ??
          currentOrder.tracking_number,
      }));
    } catch (actionError) {
      console.error(
        "Order action error:",
        actionError
      );

      setError(actionError.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Loading display
  if (loading) {
    return (
      <div className="min-h-screen text-white">
        <AdminHeader />

        <p className="p-8 text-center">
          Loading order...
        </p>
      </div>
    );
  }

  // Error display when the order could not load
  if (error && !order) {
    return (
      <div className="min-h-screen text-white">
        <AdminHeader />

        <div className="p-8 text-center">
          <p className="text-red-300">
            {error}
          </p>

          <Link
            to="/adminOrders"
            className="mt-4 inline-block underline"
          >
            Return to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 text-white">
      <AdminHeader />

      <main className="mx-8 mt-8 md:mx-13">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl md:text-5xl">
              Order Details
            </h1>

            <p className="mt-1 break-all font-serif text-base text-white/80 md:text-xl">
              Order {order.order_id}
            </p>
          </div>

          <Link
            to="/adminOrders"
            className="w-fit rounded-full border border-white/60 bg-white/10 px-5 py-2 font-serif text-sm transition hover:scale-105 hover:bg-white/20"
          >
            Return to Orders
          </Link>
        </div>

        {/* Order information container */}
        <section className="mt-8 rounded-xl border border-white/30 bg-white/10 p-4 md:p-8">
          {/* Current status */}
          <div className="mb-6">
            <p className="text-sm uppercase tracking-wide text-white/70">
              Current Status
            </p>

            <span className="mt-2 inline-flex rounded-full border border-white/30 bg-[#8B6B4A]/40 px-4 py-2 font-serif capitalize">
              {order.status?.replaceAll("_", " ")}
            </span>
          </div>

          {/* Customer and order details */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/70">
                Customer
              </p>

              <p className="mt-1 break-words font-serif text-lg">
                {order.customer_email || ""}
              </p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-wide text-white/70">
                Order Date
              </p>

              <p className="mt-1 font-serif text-lg">
                {order.order_date
                  ? new Date(
                      order.order_date
                    ).toLocaleDateString()
                  : ""}
              </p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-wide text-white/70">
                Total
              </p>

              <p className="mt-1 font-serif text-lg">
                $
                {Number(
                  order.total ?? 0
                ).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-wide text-white/70">
                Tracking Number
              </p>

              <p className="mt-1 break-all font-mono">
                {order.tracking_number ?? ""}
              </p>
            </div>
          </div>

          {/* Ordered items */}
          <div className="mt-8">
            <h2 className="font-serif text-2xl italic">
              Items
            </h2>

            <div className="mt-4 space-y-3">
              {order.items?.length > 0 ? (
                order.items.map((item) => (
                  <div
                    key={item.order_item_id}
                    className="flex flex-col gap-2 rounded-lg border border-white/20 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="font-serif">
                      {item.product_name ||
                        "Product"}
                    </p>

                    <p className="font-sans">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-white/70">
                  No items found for this order.
                </p>
              )}
            </div>
          </div>

          {/* Only display approval controls for on_hold orders */}
          {order.status === "on_hold" && (
            <div className="mt-8 border-t border-white/20 pt-6">
              <h2 className="font-serif text-2xl italic">
                Review Order
              </h2>

              <p className="mt-1 text-white/80">
                Accept or decline this customer
                order.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {/* Accept captures Stripe payment */}
                <button
                  type="button"
                  onClick={() =>
                    handleOrderAction("accept")
                  }
                  disabled={updatingStatus}
                  className="rounded-lg bg-[#8B6B4A] px-6 py-3 font-serif text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingStatus
                    ? "Updating..."
                    : "Accept Order"}
                </button>

                {/* Decline releases or refunds Stripe payment */}
                <button
                  type="button"
                  onClick={() =>
                    handleOrderAction("decline")
                  }
                  disabled={updatingStatus}
                  className="rounded-lg border border-red-300 bg-red-900/30 px-6 py-3 font-serif text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingStatus
                    ? "Updating..."
                    : "Deny Order"}
                </button>
              </div>
            </div>
          )}

          {/* Backend action error */}
          {error && order && (
            <p className="mt-6 text-red-300">
              {error}
            </p>
          )}
        </section>
      </main>

      <AdminNav />
    </div>
  );
}

export default AdminOrderDetails;