import { Link } from "react-router-dom";
import AdminNav from "../components/AdminNav";


function AdminUpdateWebsitePhoto() {
  return (
    <div className="min-h-screen p-8">
      
      {/* Greeting, Admin in light grey box */}
      <div className="w-full flex justify-center mt-6 mb-8">
        <div className="w-96 w-[600px] py-4 text-center">
          <h1 className="text-xl font-semibold">Admin - Update Website Photo</h1>
        </div>
      </div>
      {/* Button Grid */}
      <div className="flex justify-center gap-24 mt-8">
        
      

        {/* Update a website photo right box*/}
        <div className="w-full max-w-md p-6 pb-12 rounded-2xl shadow-sm">
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

      
    <AdminNav/>

    </div>
  );
}

export default AdminUpdateWebsitePhoto;
