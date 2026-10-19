import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

const PaymentSuccessful = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queryError, setQueryError] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      if (authLoading) return;

      if (!user || (!user.email && !user.id)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setQueryError(null);

        // 1. Fetch Orders
        let query = supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (user.email && user.id) {
          query = query.or(`customer_email.eq.${user.email},user_id.eq.${user.id}`);
        } else if (user.email) {
          query = query.eq("customer_email", user.email);
        } else {
          query = query.eq("user_id", user.id);
        }

        const { data: ordersData, error: ordersError } = await query;

        if (ordersError) throw ordersError;

        if (!ordersData || ordersData.length === 0) {
          setOrders([]);
          setLoading(false);
          return;
        }

        // 2. Fetch order items, joining products AND product_images (matching your AdminProductTile logic)
        const orderIds = ordersData.map((order) => order.id);

        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select(`
            *,
            products (
              *,
              product_images (*)
            )
          `)
          .in("order_id", orderIds);

        if (itemsError) {
          console.warn("Error fetching order items with products/images:", itemsError.message);
        }

        // 3. Combine items into orders
        const combinedOrders = ordersData.map((order) => {
          const items = (itemsData || []).filter(
            (item) => item.order_id === order.id
          );
          return {
            ...order,
            order_items: items,
          };
        });

        setOrders(combinedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setQueryError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user, authLoading]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

return (
  <div className="min-h-screen pt-28 md:pt-40 pb-16 bg-[#C5AE98] text-white">
    <div className="mt-8 ml-8 mr-8 md:ml-13 md:mr-13">
      <h1 className="text-3xl md:text-5xl font-serif">
        Your Order History
      </h1>

    <p className="text-base md:text-xl font-serif leading-relaxed">
      View your past orders
    </p>
  </div>

    <main className="mt-4 md:mt-8 ml-8 mr-[22px] md:ml-13 md:mr-10">
      {loading || authLoading ? (
        <p className="text-white/80">Loading your past orders...</p>
        ) : queryError ? (
          <div className="border border-red-400 bg-red-500/20 rounded-xl p-6 text-center text-white">
            <p className="font-semibold">Error loading orders:</p>
            <p className="text-sm mt-1">{queryError}</p>
          </div>
         ) : orders.length === 0 ? (
          <div className="p-8 md:p-12 text-center text-white/80 font-serif italic text-base md:text-xl md:border md:border-white/20 rounded-xl bg-black/10">
            No past orders found.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const firstItem = order.order_items?.[0];
              const product = firstItem?.products;
              const images = product?.product_images;

              // Check if image exists using the exact admin pattern
              const hasImage = images && images.length > 0 && images[0].image_url;

              return (
                <div
                  key={order.id}
                  className="w-full min-h-18 md:min-h-25 p-4 rounded-lg bg-white/15 md:border md:border-white/30 shadow-sm text-white flex items-center justify-between hover:scale-[1.02] transition duration-200"
                >
                {/* Order thumbnail */}
                {hasImage ? (
                  <img
                    src={images[0].image_url}
                    alt={product?.name || "Order item"}
                    className="w-16 h-14 md:w-20 md:h-20 shrink-0 object-cover rounded-sm mr-4"
                  />
                ) : (
                  <div className="w-16 h-14 md:w-20 md:h-20 shrink-0 bg-white/20 rounded-sm mr-4 flex items-center justify-center text-xs text-white">
                    No Image
                  </div>
                )}
                {/* Order Date & Price */}
                <div className="flex-1 min-w-0 font-serif flex flex-col items-end whitespace-nowrap">
                  <span className="text-base md:text-2xl font-medium capitalize">
                    {formatDate(order.created_at)}
                  </span>

                  {order.total_amount && (
                    <span className="text-xs md:text-sm text-white/70">
                      Total: ${Number(order.total_amount).toFixed(2)}
                    </span>
                  )}
                </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default PaymentSuccessful;