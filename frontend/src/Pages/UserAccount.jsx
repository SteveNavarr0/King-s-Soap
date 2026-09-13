import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function UserAccount() {
  const { user, signOutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOutUser();
    navigate("/");
  };
  return (
    <div className="min-h-screen bg-gray-200 p-8">
      
      {/* Greeting */}
      <h1 className="text-2xl font-medium mb-10">
        Hello, {user?.user_metadata?.first_name || user?.email || "User"}
      </h1>

      {/* Button Grid */}
      <div className="flex justify-center gap-24 mt-8">
        
        {/* Change Password */}
        <Link to="/userChangePassword">
        <div
          className="w-100 h-100 bg-[#c4b5a5] flex items-center justify-center cursor-pointer hover:scale-105 transition"
        >
            <button className="border border-black px-10 py-4 text-xl font-semibold">
                Change Password
            </button>    
          
        </div>
        </Link>

        {/* Change Address */}
        <Link to="/userChangeAddress">
        <div
          className="w-100 h-100 bg-[#c4b5a5] flex items-center justify-center cursor-pointer hover:scale-105 transition"
        >
            <button className="border border-black px-10 py-4 text-xl font-semibold">
                Change Address
            </button>    
        </div>
        </Link>

        {/* Log Out */}
        <div
          onClick={handleLogout}
          className="w-100 h-100 bg-[#c4b5a5] flex items-center justify-center cursor-pointer hover:scale-105 transition"
        >
          <button className="border border-black px-10 py-4 text-xl font-semibold">
            Log Out
          </button>
        </div>

      </div>
    </div>
  );
}

export default UserAccount;
