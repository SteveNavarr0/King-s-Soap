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
        .select("order_id, status, total, customer_email, shipping_address, tracking_number, order_date, items")
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
      <div className="mt-4 md:mt-8 bg-white/10 rounded-xl p-4 md:p-6">
        <h2 className="text-2xl md:text-3xl font-serif italic mb-6">
          Orders
        </h2>

        <div className="overflow-x-auto">
        <div className="min-w-[1100px]">

    {/* Column headings */}
    <div className="grid grid-cols-7 gap-5 px-4 py-3 font-semibold">
      <div>Contact</div>
      <div>Items</div>
      <div>Total</div>
      {/*<div>Shipping Address</div>*/}
      <div className="col-span-2">Tracking</div>
      <div>Date</div>
      <div>Status</div>
    </div>

    {/* One grid row per order */}
    <div className="space-y-4">
    {orders.map((order) => (
      <div
        key={order.order_id}
        className="grid grid-cols-7 gap-4 border-b border-white/20 px-4 py-4 items-start"
      >
        <div className="break-words">
          {order.customer_email}
        </div>
          <div>
          {order.items?.map((item) => (
            <div key={item.order_item_id}>
              Product {item.product_name} × {item.quantity}
            </div>
          ))}
          </div>
        <div>
          ${Number(order.total).toFixed(2)}
        </div>

        <div className="col-span-2 break-all">
          {order.shipping_address?.type === "local_pickup"
          ? "Local Pickup"
          : order.tracking_number ?? ""}
        </div>

        <div>
          {new Date(order.order_date).toLocaleDateString()}
        </div>
        <div>{order.status}</div>
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
