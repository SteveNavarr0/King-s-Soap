import { Link } from "react-router-dom";

function Admin() {
  return (
    <div className="min-h-screen bg-gray-200 p-8">
      
      {/* Greeting, Admin in light grey box */}
      <div className="w-full flex justify-center mt-6 mb-8">
        <div className="bg-gray-300 w-96 w-[600px] py-4 text-center">
          <h1 className="text-xl font-semibold">Admin</h1>
        </div>
      </div>
      {/* Button Grid */}
      <div className="flex justify-center gap-24 mt-8">
        
        {/* Create a Product in Shop box */}
        <Link to="/adminCreateProduct">
        <div
          className="w-120 h-120 bg-[#c4b5a5] flex items-center justify-center cursor-pointer hover:scale-105 transition"
        >
          <div className="flex flex-col items-center text-center">
            
            {/* Line */}
            <div className="w-64 border-t-4 border-black"></div>

            {/* Title */}
            <h2 className="mt-6 text-2xl font-bold text-black leading-tight">
              Create a Product in Shop
            </h2>

            {/* Description */}
            <p className="mt-3 text-sm text-gray-500 max-w-xs">
              A product will be added to the shop to be sold!
            </p>

            {/* Button */}
            <button className="mt-8 bg-black text-white px-12 py-3 rounded-md text-sm">
              Create Product
            </button>

          </div>
        </div>
        </Link>

        {/* Delete a Product From Shop*/}
        <Link to="/adminDeleteProduct">
        <div
          className="w-120 h-120 bg-[#c4b5a5] flex items-center justify-center cursor-pointer hover:scale-105 transition"
        >
          <div className="flex flex-col items-center text-center">
            
            {/* Line */}
            <div className="w-64 border-t-4 border-black"></div>

            {/* Title */}
            <h2 className="mt-6 text-2xl font-bold text-black leading-tight">
              Delete a Product From Shop
            </h2>

            {/* Description */}
            <p className="mt-3 text-sm text-gray-500 max-w-xs">
              A product will be removed from the shop and no longer sold!
            </p>

            {/* Button */}
            <button className="mt-8 bg-black text-white px-12 py-3 rounded-md text-sm">
              Delete Product
            </button>

          </div>
        </div>
        </Link>

      </div>

      {/* Button Grid */}
      <div className="flex justify-center gap-24 mt-8">
        
        {/* Update a Product in Shop*/}
        <Link to="/adminUpdateProduct">
        <div
          className="w-120 h-120 bg-[#c4b5a5] flex items-center justify-center cursor-pointer hover:scale-105 transition"
        >
          <div className="flex flex-col items-center text-center">
            
            {/* Line */}
            <div className="w-64 border-t-4 border-black"></div>

            {/* Title */}
            <h2 className="mt-6 text-2xl font-bold text-black leading-tight">
              Update a Product in Shop
            </h2>

            {/* Description */}
            <p className="mt-3 text-sm text-gray-500 max-w-xs">
              A product in the shop will be updated!
            </p>

            {/* Button */}
            <button className="mt-8 bg-black text-white px-12 py-3 rounded-md text-sm">
              Update Product
            </button>

          </div>
        </div>
        </Link>

        {/* Update Website Photo */}
       <Link to="/adminUpdateWebsitePhoto">
        <div
          className="w-120 h-120 bg-[#c4b5a5] flex items-center justify-center cursor-pointer hover:scale-105 transition"
        >
          <div className="flex flex-col items-center text-center">
            
            {/* Line */}
            <div className="w-64 border-t-4 border-black"></div>

            {/* Title */}
            <h2 className="mt-6 text-2xl font-bold text-black leading-tight">
              Update Website Photo
            </h2>

            {/* Description */}
            <p className="mt-3 text-sm text-gray-500 max-w-xs">
               A photo in the website will be changed!
            </p>

            {/* Button */}
            <button className="mt-8 bg-black text-white px-12 py-3 rounded-md text-sm">
              Update Website Photo
            </button>

          </div>
        </div>
        </Link>

      </div>

      {/*Logout in light grey box */}
      <div className="w-full flex justify-center mt-10 mb-2">
        <div className="bg-gray-300 w-96 w-[600px] py-4 text-center hover:scale-105 transition">
          <h1 className="text-xl font-semibold">Logout</h1>
        </div>
      </div>
    </div>
  );
}

export default Admin;
