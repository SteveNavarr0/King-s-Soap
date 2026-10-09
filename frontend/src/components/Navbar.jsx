import supabase from "../supabaseClient";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BsBag } from "react-icons/bs";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const getImageUrl =  (imagePath) => {
    const { data } = supabase.storage
      .from("Product Images")
      .getPublicUrl(imagePath);
      return data.publicUrl;
};

function Navbar() {

  const { user, loading } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logo = getImageUrl("images/logo.png");

  return (
    <nav className="absolute inset-x-0 top-0 z-50 bg-transparent text-white p-2 text-center">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/" className="block outline-none">
            <img src={logo} alt="Logo" className="h-20 md:h-32 w-auto block" />
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="relative z-[60] cursor-pointer mr-6 self-start mt-3 flex h-12 w-12 flex-col items-center justify-center gap-1.5 text-white md:hidden"
        >
          <span className="h-0.5 w-7 bg-current" />
          <span className="h-0.5 w-7 bg-current" />
          <span className="h-0.5 w-7 bg-current" />
        </button>

        <div
          onClick={() => setIsMenuOpen(false)}
          className={`absolute left-0 right-0 top-0 z-50 flex flex-col items-center gap-5 bg-[#C5AE98] px-6 pt-7 pb-6 font-sans text-lg shadow-lg md:static md:flex md:flex-row md:gap-8 md:bg-transparent md:py-0 md:pl-0 md:pr-8 md:shadow-none ${
            isMenuOpen ? "flex" : "hidden md:flex"
          }`}
        >
          


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

           <NavLink
            to="/cart"
            state={{ backgroundLocation: location }}
            className={({ isActive }) =>
              `inline-block transition duration-200 hover:scale-105 ${
                isActive ? "text-[#8B6B4A]" : ""
              }`
            }
          >
            <BsBag className="text-2xl" />
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
                `inline-block transition duration-200 hover:scale-105 md:rounded-lg md:border md:px-4 md:py-2 ${
                  isActive
                    ? "text-[#5C3E28] md:border-[#5C3E28]"
                    : "text-white md:border-white"
                }`
              }
            >
              Log In
            </NavLink>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;