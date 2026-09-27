import {Link, useNavigate} from "react-router-dom";
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

    const {user, adminName, signOutUser, loading } = useAuth();

    const adminInitials = `${adminName.first?.[0] ?? ""}${adminName.last?.[0] ?? ""}`.toUpperCase();


    const logo = getImageUrl("images/logo.png");

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); /* isProfileMenuOpen stores whether the menu is open. setIsProfileMenuOpen is used to change the value of isProfileMenuOpen. useState(false) initializes state to false (not open) */

    const profileMenuRef = useRef(null); /* This will be used to detect clicks outside the menu */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && /* Check if the menu is open and if the click was outside the menu */
                !profileMenuRef.current.contains(event.target) 
            ) {
                setIsProfileMenuOpen(false); /* If the click is outside the menu, close the menu */
            }
        };

        document.addEventListener("mousedown", handleClickOutside); /* Add event listener to detect clicks outside the menu */

        return () => {
            document.removeEventListener("mousedown", handleClickOutside); /* Clean up the event listener when the component unmounts */
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
        <header className="flex items-start justify-between">

            {/* Logo*/}
            <div className = "flex justify-left">
                
                <Link to="/Admin" className="block outline-none">
                    <img src={logo} alt="King's Soap Logo" className= "w-auto md:w-auto h-32 md:h-52 block" />
                 </Link>
            
            </div>


            {/* Profile button*/}
            <div 
                ref={profileMenuRef}
                className="relative mt-10 md:mt-15 mr-8 md:mr-13"> {/* Relative positioning allows the profile menu to be positioned relative to this container */}

                <button type="button" 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} /* When the button is clicked, the value of isProfileMenuOpen is toggled between true and false. If it was false (menu closed), it becomes true (menu open), and vice versa. */
                className="w-15 md:w-25 h-15 md:h-25 rounded-full bg-white/15 backdrop-blur-lg border border-white/30 shadow-sm text-white text-xl md:text-3xl flex items-center justify-center hover:scale-105 cursor-pointer transition">
                    {adminInitials}
                </button>


                {/* Profile menu */}
                {isProfileMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-48 bg-[#D4C2AF] p-4 shadow-lg">
                        
                        <p className="text-sm md:text-md text-white font-semibold pb-1">
                            {adminName.first} {adminName.last}
                        </p>

                        <p className="text-sm md:text-md text-white pb-1">
                            {loading ? "Loading..." : user?.email}
                        </p>

                        <div className="w-44 border-t-2 border-white/30"></div>

                        <button
                            type="button" 
                            onClick={handleSignOut} //Actually sign out user rather than redirect
                            className="text-sm md:text-md text-white hover:scale-105 cursor-pointer transition">
                            
                            Sign Out
                        </button>

                    </div>
                )}

            </div>


        </header>
    )
}

export default AdminHeader;