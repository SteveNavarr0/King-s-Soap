import { Link } from "react-router-dom";

function AdminUpdateWebsitePhoto() {
  return (
    <div className="min-h-screen bg-gray-200 p-8">
      
      {/* Greeting, Admin in light grey box */}
      <div className="w-full flex justify-center mt-6 mb-8">
        <div className="bg-gray-300 w-96 w-[600px] py-4 text-center">
          <h1 className="text-xl font-semibold">Admin - Update Website Photo</h1>
        </div>
      </div>
      {/* Button Grid */}
      <div className="flex justify-center gap-24 mt-8">
        
       {/* Update a website photo left box */}
       <Link to="/adminUpdateWebsitePhoto">
        <div
          className="w-120 h-120 bg-[#c4b5a5] flex items-center justify-center cursor-pointer hover:scale-105 transition"
        >
          <div className="flex flex-col items-center text-center -mt-10">
            
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


          </div>
        </div>
        </Link>

        {/* Update a website photo right box*/}
        <div className="w-full max-w-md bg-grey p-6 pb-12 rounded-2xl shadow-sm">
            <div className="space-y-4">
            <div className=" text-center">
                <h1 className="text-xl font-semibold">Update Website Photo</h1>
            </div>
            <div>
                <label className="block text-sm text-gray-800 mb-2">Current Website Photo</label>
                <input
                placeholder="example-current-website-photo.png"
                readOnly
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                />
            </div>

            {/* Line */}
            <div className="border-t-4 border-black"></div>

            <div>
                <label className="block text-sm text-gray-800 mb-2">
                New photo to replace current website photo
                </label>
                <input
                placeholder="example-new-website-photo.png"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                />
            </div>
         

            <button className="w-full bg-zinc-800 text-white py-2 rounded-lg mt-2 hover:scale-105 transition">
                Update Website Photo
            </button>
            </div>
        </div>

      </div>

      

      {/*Logout or return to admin would go here */}
      <Link to="/admin">
        <div className="w-full flex justify-center mt-10 mb-2">
            <div className="bg-gray-300 w-96 w-[600px] py-4 text-center hover:scale-105 transition">
            <h1 className="text-xl font-semibold">Return to Admin </h1>
            </div>
        </div>
      </Link>

    </div>
  );
}

export default AdminUpdateWebsitePhoto;
