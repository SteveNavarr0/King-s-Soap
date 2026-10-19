import supabase from "../supabaseClient";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { BsBag } from "react-icons/bs";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const getImageUrl = (imagePath) => {
  const { data } = supabase.storage
    .from("Product Images")
    .getPublicUrl(imagePath);
  return data.publicUrl;
};

function Navbar() {
  const { user, loading, signOutUser } = useAuth();

  const userInitials =
    user?.user_metadata?.first_name?.trim()?.[0]?.toUpperCase() || "";

  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const logo = getImageUrl("images/logo.png");

  // Close profile dropdown when clicking outside
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
    <nav className="absolute inset-x-0 top-0 z-50 bg-transparent text-white p-2 text-center">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div>
          <Link to="/" className="block -ml-2 outline-none">
            <img src={logo} alt="Logo" className="h-25 md:h-32 w-auto block" />
          </Link>
        </div>

        {/* Mobile Hamburger Menu Button */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="relative z-[60] cursor-pointer mr-1 self-start mt-6 flex h-12 w-12 flex-col items-center justify-center gap-1.5 text-white md:hidden"
        >
          <span className="h-0.5 w-7 bg-current" />
          <span className="h-0.5 w-7 bg-current" />
          <span className="h-0.5 w-7 bg-current" />
        </button>

        {/* Navigation Drawer / Links */}
        <div
          onClick={() => setIsMenuOpen(false)}
          className={`absolute left-0 right-0 top-0 z-50 flex flex-col items-center gap-5 bg-[#C5AE98] px-6 pt-7 pb-6 font-sans text-lg shadow-lg md:static md:flex md:flex-row md:gap-8 md:bg-transparent md:py-0 md:pl-0 md:pr-8 md:shadow-none ${
            isMenuOpen ? "flex" : "hidden md:flex"
          }`}
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              `inline-block transition duration-200 hover:scale-105 ${
                isActive ? "text-[#8B6B4A]" : ""
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/shop"
            className={({ isActive }) =>
              `inline-block transition duration-200 hover:scale-105 ${
                isActive ? "text-[#8B6B4A]" : ""
              }`
            }
          >
            Shop
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `inline-block transition duration-200 hover:scale-105 ${
                isActive ? "text-[#8B6B4A]" : ""
              }`
            }
          >
            About
          </NavLink>



           {!loading && user && (
            <NavLink
              to="/OrderHistory"
              className={({ isActive }) =>
                `inline-block transition duration-200 hover:scale-105 ${
                  isActive ? "text-[#8B6B4A]" : ""
                }`
              }
            >
              Orders
            </NavLink>
          )}


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

          {!loading && user && (
            <div className="md:hidden w-full flex flex-col items-center gap-5 border-t border-white/30 pt-5 font-sans text-sm">
              <p className="max-w-full truncate text-sm text-white">
                {user.email}
              </p>

              <Link
                to="/UserChangePassword"
                onClick={() => setIsMenuOpen(false)}
                className="transition duration-200 hover:scale-105"
              >
                Change Password
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="cursor-pointer transition duration-200 hover:scale-105"
              >
                Sign Out
              </button>
            </div>
          )}

          {!loading && user ? (
            <div ref={profileMenuRef} className="relative hidden md:inline-block text-left">
              <button
                type="button"
                onClick={toggleDropdown}
                aria-label="Account menu"
                aria-expanded={isProfileMenuOpen}
                className="flex w-12 h-12 shrink-0 rounded-full bg-white/15 backdrop-blur-lg border border-white/30 shadow-sm text-white text-xl items-center justify-center hover:scale-105 cursor-pointer transition outline-none"
              >
                {userInitials}
              </button>

              {/* Profile dropdown menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 bg-[#D4C2AF] p-4 shadow-lg text-left">
                  <p className="text-sm md:text-md text-white pb-1 truncate">
                    {loading ? "Loading..." : user?.email}
                  </p>

                  <div className="w-full border-t-2 border-white/30 my-2"></div>


                  <Link
                    to="/UserChangePassword"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="block text-sm md:text-md text-white hover:scale-102 cursor-pointer transition pb-2"
                  >
                    Change Password
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="block text-sm md:text-md text-white hover:scale-102 cursor-pointer transition w-full text-left"
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