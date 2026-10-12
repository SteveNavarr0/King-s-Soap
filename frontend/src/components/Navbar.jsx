import supabase from "../supabaseClient";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BsBag } from "react-icons/bs";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";

const getImageUrl = (imagePath) => {
  const { data } = supabase.storage
    .from("Product Images")
    .getPublicUrl(imagePath);
  return data.publicUrl;
};

function Navbar() {
  const { user, loading, signOutUser } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  const logo = getImageUrl("images/logo.png");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOutUser();

    if (error) {
      console.error("Could not sign out:", error);
      return;
    }

    navigate("/login");
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProfileMenuOpen((prev) => !prev);
  };

  return (
    <nav className="bg-[#C5AE98] text-[#FFFFFF] p-2 text-center relative z-50">
      <div className="flex justify-between items-center">

        <div>
          <Link to="/" className="block outline-none">
            <img src={logo} alt="Logo" className="h-32 w-auto block" />
          </Link>
        </div>

        <div className="space-x-8 pr-8 font-[Inter] text-lg flex items-center">
          
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
            <div ref={profileMenuRef} className="relative inline-block text-left">
              <button
                type="button"
                onClick={toggleDropdown}
                className={`inline-block border rounded-lg px-4 py-2 transition duration-200 hover:scale-105 hover:bg-white/20 outline-none cursor-pointer ${
                  isProfileMenuOpen
                    ? "text-[#8B6B4A] border-[#8B6B4A] bg-white/10"
                    : "text-white border-white"
                }`}
              >
                Account
              </button>

              {/* Profile dropdown menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 bg-[#D4C2AF] p-4 shadow-lg text-left">
                  
                  <p className="text-sm md:text-md text-white pb-1 truncate">
                    {loading ? "Loading..." : user?.email}
                  </p>

                  <div className="w-full border-t-2 border-white/30 my-2"></div>

                  <Link
                    to="/OrderHistory"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="block text-sm md:text-md text-white hover:scale-105 cursor-pointer transition pb-2"
                  >
                    Order History
                  </Link>

                  <Link
                    to="/UserChangePassword"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="block text-sm md:text-md text-white hover:scale-105 cursor-pointer transition pb-2"
                  >
                    Change Password
                  </Link>

                  <div className="w-full border-t-2 border-white/30 my-2"></div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="block text-sm md:text-md text-white hover:scale-105 cursor-pointer transition w-full text-left"
                  >
                    Sign Out
                  </button>

                </div>
              )}
            </div>
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