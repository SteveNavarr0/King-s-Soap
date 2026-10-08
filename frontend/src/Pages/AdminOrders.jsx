import AdminHeader from "../components/AdminHeader";
import AdminNav from "../components/AdminNav";
import supabase from "../supabaseClient";
import {useEffect, useState} from "react";  

function AdminOrders() {

  const [orders, setOrders] = useState([]); //Orders is current list, setOrders is function to update the list

  //Taken from Shop.jsx, this useEffect fetches the products from the database
  useEffect(() => {
    const fetchOrders = async () => {

      const { data, error } = await supabase
        .from("active_orders")
        .select("order_id, status, total, customer_email, tracking_number, order_date, items")
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
        <div
          key={order.order_id}
          className="flex flex-col gap-4 p-4 rounded-lg md:grid md:grid-cols-[minmax(220px,1.5fr)_minmax(260px,2fr)_minmax(100px,0.7fr)_minmax(210px,1.4fr)_minmax(90px,0.6fr)_minmax(110px,0.7fr)] border border-white/30 shadow-sm md:items-start"      >
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

        <span className="inline-flex px-3 py-1 rounded-full border border-white/30 bg-[#8B6B4A]/30 font-serif text-sm text-white capitalize">
          {order.status}
        </span>
      </div>

      </div>
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
