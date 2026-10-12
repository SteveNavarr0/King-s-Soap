import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

function UserChangeAddress() {

  const [streetAddress, setStreetAddress] = useState("");
  const [aptNum, setAptNum] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState([]);// change to array, maybe change how we are storing in the db?
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  //const [user, setUser] = useState([]);

  const { user, setUser } = useAuth();
  const [address, setAddress] = useState(null);

  

useEffect(() => {
    const fetchUserAddress = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select('id, email, Street, "Apt. Num", City, State, Country, "Zip Code"')
        .eq("id", user.id)
        .single();

      if (error) {
        console.log("Error:", error);
        return;
      }

      console.log("Address:", data);

      setAddress(data);

      // Put database values into the input states
      setStreetAddress(data.Street || "");
      setAptNum(data["Apt. Num"] || "");
      setCity(data.City || "");
      setState(data.State || "");
      setCountry(data.Country || "");
      setZipCode(data["Zip Code"] || "");
      
    };

    fetchUserAddress();
  }, [user]);

  
  {/*
  useEffect(() => {
    const fetchUserAddress = async () => {

      const { data, error } = await supabase
        .from("users")
        .select("id, Street, Apt. Num, City, State, Country, Zip Code");

      setUser(data);
      alert(data);
    };

    fetchUserAddress();
  }, []);
  */}

 const dbChangeAddress = async () => {

  setSuccess("");
  setError("");

  // Validate fields
  if (!streetAddress.trim()) {
    setError("Street Address is required");
    return;
  }

  // aptNum is optional, so no validation needed

  if (!city.trim()) {
    setError("City is required");
    return;
  }

  if (!state.trim()) {
    setError("State is required");
    return;
  }

  if (!country.trim()) {
    setError("Country is required");
    return;
  }

  if (!zipCode.trim()) {
    setError("Zip Code is required");
    return;
  }

  if (!user) {
    setError("You must be logged in.");
    return;
  }

  setLoading(true);

  try {

    const response = await fetch(
      `http://localhost:3000/api/users/${user.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          Street: streetAddress,
          "Apt. Num": aptNum || null,
          City: city,
          State: state,
          Country: country,
          "Zip Code": zipCode
        })
      }
    );

    //const result = await response.json();
    const result = await response.text();

    console.log("Status:", response.status);
    console.log("Backend response:", result);

    console.log("Backend response:", result);

    if (!response.ok) {
      setError(result.message || "Failed to change address");
      return;
    }

    setSuccess("Address changed successfully!");

    setTimeout(() => {
      setSuccess("");
    }, 2000);

  } catch (err) {

    console.error("Fetch error:", err);
    setError("Could not reach backend");

  } finally {

    setLoading(false);

  }
};

 return (
    <div className="min-h-screen pb-16">
      
      
      <div className="flex flex-col justify-left mt-4 md:mt-8 ml-8 md:ml-13 text-white">

        <h1 className="text-3xl md:text-5xl font-serif">
          Change Address
        </h1>
      </div>

        {/* Create a Product From Shop right box*/}
        <div className="w-full max-w-md mx-auto p-6 pb-12 rounded-2xl md:border md:border-white/30 md:shadow-lg bg-[#C5AE98]/20 backdrop-blur-lg mt-2 md:mt-12 md:mb-24">
            
          <div className="space-y-4">

            <div>
                <label className="block text-md md:text-2xl text-white mb-2">Street Address</label>
                <input
                  placeholder="Value"
                  className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                />
            </div>



            <div>
                <label className="block text-md md:text-2xl text-white mb-2">Apartment Number/Suit/Unit (Optional)</label>
                <input
                  placeholder="Value"
                  className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                  value={aptNum}
                  onChange={(e) => setAptNum(e.target.value)}
                />
            </div>



            <div>
                <label className="block text-md md:text-2xl text-white mb-2">City</label>
                <input
                  placeholder="Value"
                  className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
            </div>


            <div>
                <label className="block text-md md:text-2xl text-white mb-2">State</label>
                <input
                  placeholder="Value"
                  className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
            </div>



             <div>
                <label className="block text-md md:text-2xl text-white mb-2">Country</label>
                <input
                  placeholder="Value"
                  className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-md md:text-2xl text-white mb-2">Zip Code</label>
                <input
                  placeholder="Value"
                  className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
            </div>



          {/* Display success or error messages */}
            {error && (
               <p className="text-red-600 text-sm md:text-xl text-center">{error}</p>
            )}

            {success && (
               <p className="text-green-600 text-sm md:text-xl text-center">{success}</p>
            )}

            <button onClick ={dbChangeAddress}
              disabled={loading}
              className={`mt-8 w-full py-2 md:h-10 rounded-lg bg-[#8B6B4A] backdrop-blur-lg border border-white/30 shadow-sm text-white text-md md:text-2xl flex items-center justify-center hover:scale-105 cursor-pointer transition ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"
              }`}
              >
                {loading ? "Updating Address..." : "Update Address"
              }
        
            </button>



            </div>
        </div>


      </div>
  );
}

export default UserChangeAddress;
