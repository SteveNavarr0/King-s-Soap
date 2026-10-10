import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";


function AdminNav() {

  //Stores number of unread customer messages
  const [unreadCount, setUnreadCount] = useState(0);

  //Retrieve number of unread messages
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from("messages")
        .select("*", {count: "exact", head: true})
        .eq("status", "unread");

        if (error) {
          console.error("Could not retrieve unread message count:", error);
          return;
        }

        setUnreadCount(count || 0);
    };

    fetchUnreadCount();
  }, []);
 
  return (
    <nav className="fixed bottom-0 py-6 pt-6 left-0 z-50 flex w-full items-center justify-evenly bg-[#C5AE98] text-white font-[Inter] text-md md:text-2xl p-2">
      
          <NavLink to="/admin" className={({ isActive }) =>
            `inline-block transition duration-200 hover:scale-105 ${
              isActive ? "text-[#8B6B4A]" : ""
            }`
          }>
            Home
          </NavLink>

          <NavLink to="/AdminProducts" className={({ isActive }) =>
            `inline-block transition duration-200 hover:scale-105 ${
              isActive ? "text-[#8B6B4A]" : ""
            }`
          }>
            Products
          </NavLink>


          <NavLink to="/adminShipping" className={({ isActive }) =>
            `inline-block transition duration-200 hover:scale-105 ${
              isActive ? "text-[#8B6B4A]" : ""
            }`
          }>
            Shipping
          </NavLink>

          <NavLink to="/AdminDiscounts" className={({ isActive }) =>
            `inline-block transition duration-200 hover:scale-105 ${
              isActive ? "text-[#8B6B4A]" : ""
            }`
          }>
            Discounts
          </NavLink>

          <NavLink to="/AdminInbox" className={({ isActive }) =>
            `relative inline-block transition duration-200 hover:scale-105 ${
              isActive ? "text-[#8B6B4A]" : ""
            }`
          }>
            Inbox

            {/*Display unread message count above Inbox*/}
            {unreadCount > 0 && (
              <span className="absolute -top-4 -right-5 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#8B6B4A] px-1 text-sm text-white">
                {unreadCount}
              </span>
            )}
          </NavLink>
          
    </nav>
  );
}

export default AdminNav;