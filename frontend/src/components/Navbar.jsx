import supabase from "../supabaseClient";
import { Link, NavLink } from "react-router-dom";
import { BsBag } from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

const getImageUrl =  (imagePath) => {
    const { data } = supabase.storage
      .from("Product Images")
      .getPublicUrl(imagePath);
      return data.publicUrl;
};

function Navbar() {

  const { user, loading } = useAuth();

  const logo = getImageUrl("images/logo.png");

  return (
    <nav className="bg-[#C5AE98] text-[#FFFFFF] p-2 text-center">
      <div className="flex justify-between items-center">

        <div>
          <Link to="/" className="block outline-none">
            <img src={logo} alt="Logo" className="h-32 w-auto block" />
          </Link>
        </div>

        <div className="space-x-8 pr-8 font-[Inter] text-lg">
          
          <NavLink to="/" className={({ isActive }) =>
            `inline-block transition duration-200 hover:scale-105 ${
              isActive ? "text-[#8B6B4A]" : ""
            }`
          }>
            Home
          </NavLink>

          <NavLink to="/shop" className={({ isActive }) =>
            `inline-block transition duration-200 hover:scale-105 ${
              isActive ? "text-[#8B6B4A]" : ""
            }`
          }>
            Shop
          </NavLink>

          <NavLink to="/about" className={({ isActive }) =>
            `inline-block transition duration-200 hover:scale-105 ${
              isActive ? "text-[#8B6B4A]" : ""
            }`
          }>
            About
          </NavLink>

          <NavLink to="/cart" className={({ isActive }) =>
            `inline-block transition duration-200 hover:scale-105 ${
              isActive ? "text-[#8B6B4A]" : ""
            }`
          }>
            <BsBag className="text-2xl translate-y-[3px]" />
          </NavLink>

          {!loading && user ? (
            <>
              <NavLink
                to="/userAccount"
                className={({ isActive }) =>
                  `inline-block border rounded-lg px-4 py-2 transition duration-200 hover:scale-105 hover:bg-white/20 ${
                    isActive ? "text-[#8B6B4A] border-[#8B6B4A]" : "text-white border-white"
                  }`
                }
              >
                Account
              </NavLink>
            </>
          ) : (
            <NavLink
              to="/login"
              end
              className={({ isActive }) =>
                `inline-block border rounded-lg px-4 py-2 transition duration-200 hover:scale-105 hover:bg-white/20 ${
                  isActive
                    ? "text-[#8B6B4A] border-[#8B6B4A]"
                    : "text-white border-white"
                }`
              }
            >
              Log in
            </NavLink>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;