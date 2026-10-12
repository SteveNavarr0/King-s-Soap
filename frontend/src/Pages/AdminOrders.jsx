import AdminHeader from "../components/AdminHeader";
import AdminNav from "../components/AdminNav";
import supabase from "../supabaseClient";
import { Link } from "react-router-dom";
import {useEffect, useState} from "react";  

function AdminOrders() {

  const [orders, setOrders] = useState([]); //Orders is current list, setOrders is function to update the list

  //Taken from Shop.jsx, this useEffect fetches the products from the database
  useEffect(() => {
    const fetchOrders = async () => {

      const { data, error } = await supabase
        .from("active_orders")
        .select("order_id, status, total, customer_email, fulfillment_type, tracking_number, order_date, items")
        .order("order_date", { ascending: true });
        if (error){
          console.error("Error fetching orders:", error);
          return;
        }
        
      setOrders(data || []); //Function to store returned data to products variable
    };

    fetchOrders();
  }, []);
/*
  const sortedProducts = [...products].sort((a, b) => {
    const salesA = a.sales ?? 0;
    const salesB = b.sales ?? 0;
    if (salesB !== salesA) {
      return salesB - salesA; // Sort by sales in descending order
    }
    return (a.name || "").localeCompare(b.name || ""); // Sort by name in ascending order if sales are equal
  });

*/
  return (
    <div className="min-h-screen pb-16"> {/* Container for the AdminProducts page */}
      
      <AdminHeader /> {/*Logo and profile button*/}
      
      <div className="flex flex-col mt-8 ml-8 mr-8 md:ml-13 md:mr-13 text-white">
      <h1 className="text-3xl md:text-5xl font-serif">
        Active Orders
      </h1>

      <p className="text-base font-serif md:text-xl leading-relaxed">
        View and manage current customer orders
      </p>
        <Link
          to="/adminArchivedOrders"
          className="w-fit rounded-full border border-white/60 bg-white/10 px-5 py-2 font-serif text-sm text-white transition hover:scale-105 hover:bg-white/20"
        >
          Order Archive
        </Link>

      {/* Orders section */}
      <div className="mt-4 md:mt-8 mb-6 bg-white/10 rounded-xl p-4 md:p-8 md:border md:border-white/30">
        {/* Orders header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-serif italic">
          Orders
        </h2>

        <p className="text-sm md:text-base font-serif text-white/80 mt-0.5">
          {orders.length} active orders
        </p>
      </div>

      <div className="overflow-x-auto">
        {/* Full width on mobile; preserves the wide table layout on desktop */}
        <div className="w-full md:min-w-[1100px]">
          {/* Column headings */}
          {/* Column headings — only shown in the desktop table layout */}
          <div className="hidden md:grid md:grid-cols-[minmax(220px,1.5fr)_minmax(260px,2fr)_minmax(100px,0.7fr)_minmax(210px,1.4fr)_minmax(90px,0.6fr)_minmax(110px,0.7fr)] gap-4 px-4 py-3 font-semibold">
            {/*<div>Shipping Address</div>*/}
            <div>Contact</div>
            <div>Items</div>
            <div className="md:pl-6">Total</div>
            <div>Tracking</div>
            <div>Date</div>
            <div>Status</div>
          </div>
 
      {/* One grid row per order */}
      <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order.order_id}
          to={`/adminOrders/${order.order_id}`}
          className="flex flex-col gap-4 rounded-lg border border-white/30 p-4 shadow-sm transition hover:scale-[1.01] hover:bg-white/10 md:grid md:grid-cols-[minmax(220px,1.5fr)_minmax(260px,2fr)_minmax(100px,0.7fr)_minmax(210px,1.4fr)_minmax(90px,0.6fr)_minmax(110px,0.7fr)] md:items-start">
          <div className="break-words">
            {/* Mobile label; desktop uses the column heading */}
            <span className="block md:hidden mb-1 font-sans text-xs uppercase tracking-wide text-white/90">
              Contact
            </span>
            <p className="font-serif text-base text-white md:text-lg font-medium">
              {order.customer_email}
            </p>
          </div>

          <div>
            {/* Mobile label; desktop uses the column heading */}
            <span className="block md:hidden mb-1 font-sans text-xs uppercase tracking-wide text-white/90">
              Items
            </span>
            <div className="space-y-1 font-sans text-sm md:text-base">
              {order.items?.map((item) => (
                <div key={item.order_item_id}>
                  Product {item.product_name} × {item.quantity}
                </div>
              ))}
            </div>


          </div>


        <div className="md:pl-6">
          {/* Mobile label; desktop uses the column heading */}
          <span className="block md:hidden mb-1 font-sans text-xs uppercase tracking-wide text-white/90">
            Total
          </span>

          <p className="font-sans text-sm md:text-base">
            ${Number(order.total).toFixed(2)}
          </p>
        </div>

        <div className="break-all">
          {/* Mobile label; desktop uses the column heading */}
          <span className="block md:hidden mb-1 font-sans text-xs uppercase tracking-wide text-white/90">
            Tracking
          </span>

          <p className="font-mono text-sm md:text-base">
            {order.fulfillment_type === "pickup"
              ? "Local Pickup"
              : order.tracking_number ?? "Not available"}
          </p>
        </div>

        <div>
        {/* Mobile label; desktop uses the column heading */}
        <span className="block md:hidden mb-1 font-sans text-xs uppercase tracking-wide text-white/90">
          Date
        </span>

        <p className="font-sans text-sm md:text-base">
          {new Date(order.order_date).toLocaleDateString()}
        </p>
        </div>

        <div>
          {/* Mobile label; desktop uses the column heading */}
          <span className="block md:hidden mb-1 font-sans text-xs uppercase tracking-wide text-white/90">
            Status
          </span>

          {order.status === "cancel_requested" ? (
              <span className="inline-flex items-center rounded-full border border-red-300 bg-red-700 px-3 py-1 text-xs font-bold text-white shadow-sm">
                Cancellation Requested
              </span>
            ) : order.status === "on_hold" ? (
              <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200">
                On Hold
              </span>
            ) : order.status === "accepted" ? (
              <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-700 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Accepted
              </span>
            ) : order.status === "postage_ready" ? (
              <span className="inline-flex items-center rounded-full border border-[#8B6B4A] bg-[#5C4033]/70 px-3 py-1 text-xs font-semibold text-amber-100">
                Postage Ready
              </span>
            ) : order.status === "ready_to_ship" ? (
              <span className= "inline-flex items-center rounded-full border border-blue-300 bg-blue-700 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Ready to Ship
              </span>
            ) : order.status === "ready_for_pickup" ? (
              <span className="inline-flex items-center rounded-full border border-blue-300 bg-blue-700 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Ready for Pickup
              </span>
            ) : order.status === "paid" ? (
              <span className="inline-flex items-center rounded-full border border-blue-400/40 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
                Paid
              </span>
            ) : (
            <span className="capitalize">{order.status}</span>
          )}
        </div>

      </Link>
    ))}

    {orders.length === 0 && (
      <p className="py-8 text-center">
        No active orders found.
      </p>
    )}
  </div>
  </div>
  </div>
  </div>
  </div>  


      <AdminNav /> {/*Navigation bar/footer*/}
      
    </div>
  );
}


export default AdminOrders;
