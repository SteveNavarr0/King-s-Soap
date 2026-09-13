import { Link, NavLink } from "react-router-dom";


function AdminNav() {

 
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

          <NavLink to="/Admin/discounts" className={({ isActive }) =>
            `inline-block transition duration-200 hover:scale-105 ${
              isActive ? "text-[#8B6B4A]" : ""
            }`
          }>
            Discounts
          </NavLink>

          <NavLink to="/Admin/inbox" className={({ isActive }) =>
            `inline-block transition duration-200 hover:scale-105 ${
              isActive ? "text-[#8B6B4A]" : ""
            }`
          }>
            Inbox
          </NavLink>
          
    </nav>
  );
}

export default AdminNav;