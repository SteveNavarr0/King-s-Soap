import AdminHeader from "../components/AdminHeader";
import supabase from "../supabaseClient";
import {useEffect, useState} from "react";  
import { Link } from "react-router-dom";

function AdminArchivedOrders() {

  const [orders, setOrders] = useState([]); //Orders is current list, setOrders is function to update the list

  //Taken from Shop.jsx, this useEffect fetches the products from the database
  useEffect(() => {
    const fetchOrders = async () => {

      const { data, error } = await supabase
        .from("archive_orders")
        .select("order_id, status, total, customer_email, tracking_number, order_date, items, archived_at")
        .order("archived_at", {ascending: false, nullsFirst: false,});
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
        Archived Orders
      </h1>

      <p className="text-base font-serif md:text-xl leading-relaxed">
        View fulfilled and cancelled customer orders
      </p>

      <Link
          to="/adminOrders"
          className="mt-4 md:mt-8 w-[calc(50%-0.5rem)] lg:w-60 h-8 md:h-10 rounded-full bg-white/15 border border-white/30 shadow-sm text-white font-sans text-sm md:text-2xl flex items-center justify-center gap-2 hover:scale-105 cursor-pointer transition"
        >
          Back to Orders
      </Link>

      {/* Orders section */}
      <div className="mt-6 mb-6 bg-white/10 rounded-xl p-4 md:p-8 md:border md:border-white/30">
        {/* Orders header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-serif italic">
          Orders
        </h2>

        <p className="text-sm md:text-base font-serif text-white/80 mt-0.5">
          {orders.length} archived orders
        </p>
      </div>

      <div className="overflow-x-auto">
        {/* Full width on mobile; preserves the wide table layout on desktop */}
        <div className="w-full md:min-w-[1100px]">
          {/* Column headings */}
          {/* Column headings — only shown in the desktop table layout */}
          <div className="hidden md:grid md:grid-cols-[minmax(220px,1.5fr)_minmax(260px,2fr)_minmax(100px,0.7fr)_minmax(210px,1.4fr)_minmax(110px,0.7fr)_minmax(110px,0.7fr)_minmax(120px,0.8fr)] gap-4 px-4 py-3 font-semibold">
            {/*<div>Shipping Address</div>*/}
            <div>Contact</div>
            <div>Items</div>
            <div className="md:pl-6">Total</div>
            <div>Tracking</div>
            <div>Order Date</div>
            <div>Status</div>
            <div>Archived Date</div>
          </div>
 
      {/* One grid row per order */}
      <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.order_id}
          className="flex flex-col gap-4 rounded-lg border border-white/30 p-4 shadow-sm md:grid md:grid-cols-[minmax(220px,1.5fr)_minmax(260px,2fr)_minmax(100px,0.7fr)_minmax(210px,1.4fr)_minmax(110px,0.7fr)_minmax(110px,0.7fr)_minmax(120px,0.8fr)] md:items-start">
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
            {order.shipping_address?.type === "local_pickup"
              ? "Local Pickup"
              : order.tracking_number ?? "Not available"}
          </p>
        </div>

        <div>
        {/* Mobile label; desktop uses the column heading */}
        <span className="block md:hidden mb-1 font-sans text-xs uppercase tracking-wide text-white/90">
          Order Date
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

        <span className="inline-flex px-3 py-1 rounded-full border border-white/30 bg-[#8B6B4A]/30 font-serif text-sm text-white capitalize">
          {order.status}
        </span>
      </div>

      <div>
        <span className="block md:hidden mb-1 font-sans text-xs uppercase tracking-wide text-white/90">
          Archived Date
        </span>

        <p className="font-sans text-sm md:text-base">
          {order.archived_at ? new Date(order.archived_at).toLocaleDateString(): ""}
        </p>
      </div>

      </div>
    ))}

    {orders.length === 0 && (
      <div className="p-8 md:p-12 text-center text-white/80 font-serif italic text-base md:text-xl md:border md:border-white/20 rounded-xl bg-black/10">
        No archived orders found.
      </div>
    )}
  </div>
  </div>
  </div>
  </div>
  </div>  


      
    </div>
  );
}


export default AdminArchivedOrders;
