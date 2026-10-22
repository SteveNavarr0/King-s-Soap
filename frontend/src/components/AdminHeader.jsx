import {Link, NavLink, useNavigate} from "react-router-dom";
import supabase from "../supabaseClient";  
import {useEffect, useRef, useState} from "react"; 
import { useAuth } from "../context/AuthContext"


/* Function to get the public URL of an image stored in Supabase storage. Variable used later */
const getImageUrl = (imagePath) => {
    const {data} = supabase.storage
        .from("Product Images")
        .getPublicUrl(imagePath);
    return data.publicUrl

};

function AdminHeader() {

    const navigate = useNavigate();

    const {user, signOutUser, loading } = useAuth();

    const adminInitials =
        user?.user_metadata?.first_name?.trim()?.[0]?.toUpperCase() || "";

    const logo = getImageUrl("images/logo.png");

    // Track whether the navigation menu is open
    const [isMenuOpen, setIsMenuOpen] = useState(false);

     // Store the number of unread customer messages
    const [unreadCount, setUnreadCount] = useState(0);

    // Retrieve the number of unread messages
    useEffect(() => {
        const fetchUnreadCount = async () => {
            const { count, error } = await supabase
                .from("messages")
                .select("*", { count: "exact", head: true })
                .eq("status", "unread");

            if (error) {
                console.error("Could not retrieve unread message count:", error);
                return;
            }

             setUnreadCount(count || 0);
        };

        fetchUnreadCount();

        window.addEventListener("admin-inbox-updated", fetchUnreadCount);

        return () => {
            window.removeEventListener("admin-inbox-updated", fetchUnreadCount);
        };
    }, []);


    const profileMenuRef = useRef(null); /* This will be used to detect clicks outside the menu */

     useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target)
            ) {
                setIsMenuOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    

    const handleSignOut = async () => {
        const { error } = await signOutUser();

        if (error) {
            console.error("Could not sign out:", error);
            return;
        }

        navigate("/login");
    }


    return ( 

        /* Admin Header Component */
        <header className="relative z-40 flex items-start justify-between p-2">
            {/* Logo*/}
            <div className = "flex justify-left">
                
                <Link to="/Admin" className="block outline-none">
                    <img src={logo} alt="King's Soap Logo" className= "w-auto h-25 md:h-42 block" />
                 </Link>
            
            </div>


            {/* Profile button*/}
            <div 
                ref={profileMenuRef}
                className="relative mt-6 md:mt-10 mr-3.5 md:mr-11 md:w-25 md:h-25 md:flex md:items-center md:justify-end">                 {/* Mobile hamburger */}
                <button
                    type="button"
                    aria-label={isMenuOpen ? "Close admin menu" : "Open admin menu"}
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((open) => !open)}
                    className="relative z-[60] flex h-12 w-12 flex-col items-center justify-center gap-1.5 text-white cursor-pointer md:hidden"
                >
                    {isMenuOpen ? (
                        <span className="text-4xl">×</span>
                    ) : (
                        <>
                            <span className="h-0.5 w-7 bg-current" />
                            <span className="h-0.5 w-7 bg-current" />
                            <span className="h-0.5 w-7 bg-current" />
                        </>
                    )}
                </button>

                {/* Desktop profile circle */}
                <button
                    type="button"
                    aria-label={isMenuOpen ? "Close admin menu" : "Open admin menu"}
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((open) => !open)}
                    className={`relative z-[60] hidden md:flex text-white text-3xl items-center hover:scale-105 cursor-pointer transition ${
                        isMenuOpen
                            ? "w-10 h-10 justify-end"
                            : "w-25 h-25 justify-center rounded-full bg-white/15 backdrop-blur-lg border border-white/30 shadow-sm"
                    }`}
                >
                    {isMenuOpen ? (
                        <span className="text-4xl">×</span>
                    ) : (
                        adminInitials
                    )}


                    {/* Unread badge on the profile circle or hamburger */}
                    {!isMenuOpen && unreadCount > 0 && (
                        <span className="pointer-events-none absolute bottom-0 right-0 z-[70] flex h-5 md:h-8 min-w-5 md:min-w-8 items-center justify-center rounded-full bg-[#8B6B4A] px-1 text-xs text-white">
                            {unreadCount}
                        </span>
                    )}

                </button>


                 {/* Mobile hamburger badge */}
                {!isMenuOpen && unreadCount > 0 && (
                    <span className="pointer-events-none absolute bottom-0 right-0 z-[70] flex md:hidden h-5 min-w-5 items-center justify-center rounded-full bg-[#8B6B4A] px-1 text-xs text-white">
                        {unreadCount}
                    </span>
                )}

                {/* Mobile top menu / Desktop right drawer */}
                {isMenuOpen && (
                    <nav
                        aria-label="Admin navigation"
                        className="fixed inset-x-0 top-0 z-50 max-h-dvh overflow-y-auto bg-[#C5AE98] px-6 pt-24 pb-6 shadow-lg text-white font-sans md:left-auto md:bottom-0 md:w-80 md:pt-40 md:pb-8"
                    >
                        {/* Admin navigation links */}
                        <div className="flex flex-col items-center gap-5 text-lg">
                            {[
                                { label: "Home", to: "/admin" },
                                { label: "Products", to: "/AdminProducts" },
                                { label: "Orders", to: "/AdminOrders" },
                                { label: "Shipping", to: "/adminShipping" },
                                { label: "Discounts", to: "/AdminDiscounts" },
                                { label: "Inbox", to: "/AdminInbox" },
                            ].map(({ label, to }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={to === "/admin"}
                                    onClick={() => setIsMenuOpen(false)}
                                     className={({ isActive }) =>
                                        `relative inline-block transition duration-200 hover:scale-105 ${
                                            isActive ? "text-[#8B6B4A]" : ""
                                        }`
                                    }
                                >
                                    {label}

                                    {label === "Inbox" && unreadCount > 0 && (
                                        <span className="absolute -top-2 -right-4 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8B6B4A] px-1 text-xs text-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </NavLink>
                            ))}
                        </div>

                        {/* Account information */}
                        <div className="mt-6 border-t border-white/30 pt-5 flex flex-col items-center gap-3 text-sm">
                            <p className="font-semibold">
                                {user?.user_metadata?.first_name || ""}
                            </p>

                            <p className="max-w-full truncate">
                                {loading ? "Loading..." : user?.email}
                            </p>

                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="cursor-pointer transition hover:scale-105"
                            >
                                Sign Out
                            </button>
                        </div>
                    </nav>
                )}

            </div>


        </header>
    )
}

export default AdminHeader;