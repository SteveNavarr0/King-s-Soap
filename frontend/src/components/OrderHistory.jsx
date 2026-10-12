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
    <div className="min-h-screen bg-[#C5AE98] text-white font-[Inter]">
      <div style={{ width: "100%", height: "100%" }}>
        <h1 className="text-4xl text-black font-bold font-[Inria_Serif] pl-11 pt-8">
          Your Order History
        </h1>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading || authLoading ? (
          <p className="text-white/80">Loading your past orders...</p>
        ) : queryError ? (
          <div className="border border-red-400 bg-red-500/20 rounded-xl p-6 text-center text-white">
            <p className="font-semibold">Error loading orders:</p>
            <p className="text-sm mt-1">{queryError}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="border border-white/40 rounded-xl p-8 text-center bg-white/5">
            <p className="text-lg text-white/90">
              No past orders found for {user?.email}.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const firstItem = order.order_items?.[0];
              const product = firstItem?.products;
              const images = product?.product_images;

              // Check if image exists using the exact admin pattern
              const hasImage = images && images.length > 0 && images[0].image_url;

              return (
                <div
                  key={order.id}
                  className="border border-white/40 rounded-xl p-6 bg-white/10 backdrop-blur-sm flex items-center justify-between shadow-sm transition hover:border-white"
                >
                  {/* Thumbnail Box using Admin Tile pattern */}
                  {hasImage ? (
                    <img
                      src={images[0].image_url}
                      alt={product?.name || "Order item"}
                      className="w-28 h-20 object-cover rounded-md border border-white/20 shadow-inner flex-shrink-0"
                    />
                  ) : (
                    <div className="w-28 h-20 bg-gray-300/80 rounded-md overflow-hidden flex items-center justify-center border border-white/20 shadow-inner flex-shrink-0 text-gray-600 text-xs font-medium">
                      No Image
                    </div>
                  )}

                  {/* Order Date & Price */}
                  <div className="flex-1 text-right pr-4">
                    <span className="text-3xl md:text-4xl font-serif italic tracking-wide text-white drop-shadow-sm block">
                      {formatDate(order.created_at)}
                    </span>
                    {order.total_amount && (
                      <span className="text-sm text-white/80 font-medium block mt-1">
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