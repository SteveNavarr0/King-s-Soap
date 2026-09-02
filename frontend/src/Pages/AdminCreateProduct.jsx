import { Link } from "react-router-dom";
import { useState } from "react";

//Function to add all fields to the database
function AdminCreateProduct() {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [weight, setWeight] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  //Add all fields to the product table
  const dBAddItem = async () => {


    //Make sure all fields are valid
    setSuccess("");
    setError("");

    if (!productName) {
      setError("Product name is required");
      return;
    }

    if (!price || isNaN(price)) {
      setError("Please enter a valid decimal for price");
      return;
    }

    if (!stock || isNaN(stock)) {
      setError("Please enter a valid number for inventory");
      return;
    }

    if (!weight || isNaN(weight)) {
      setError("Please enter a valid number for weight");
      return;
    }

    if (!image) {
      setError("Please upload an image for the product");
      return;
    }

    setLoading(true);

    //Form send to backend. FormData is used due to file upload
    const formData = new FormData();
      formData.append("productName", productName);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("stock", stock);
      formData.append("weight", weight);
      formData.append("category", category);

      if (image) {
        formData.append("image", image);
      }

      try {
        const response = await fetch("http://localhost:3000/api/products", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        console.log("Backend response:", result);

        if (!response.ok) {
          setError(result.message || "Failed to add product");
          return;
        }

      
        // Show success message and clear form after a delay. Don't allow double submission
        setSuccess("Product added successfully!");

        setLoading(false);

        setTimeout(() => {
          setProductName("");
          setPrice("");
          setDescription("");
          setStock("");
          setWeight("");
          setCategory("");
          setImage(null);
          setSuccess("");
        }, 3000);
        
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Could not reach backend");
      }
      finally {
      setLoading(false);
    }
  
};




  return (
    <div className="min-h-screen bg-gray-200 p-8">
      
      {/* Greeting, Admin in light grey box */}
      <div className="w-full flex justify-center mt-6 mb-8">
        <div className="bg-gray-300 w-96 w-[600px] py-4 text-center">
          <h1 className="text-xl font-semibold">Admin - Add Item</h1>
        </div>
      </div>
      {/* Button Grid */}
      <div className="flex justify-center gap-24 mt-8">
        
        {/* Create a Product in Shop left box */}
        <Link to="/adminCreateProduct">
        <div
          className="w-120 h-120 bg-[#c4b5a5] flex items-center justify-center hover:scale-105 transition"
        >
          <div className="flex flex-col items-center text-center -mt-10">
            
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

          </div>
        </div>
        </Link>

        {/* Create a Product From Shop right box*/}
        <div className="w-full max-w-md bg-grey p-6 pb-12 rounded-2xl shadow-sm">
            <div className="space-y-4">
            <div className=" text-center">
                <h1 className="text-xl font-semibold">Add Item to Shop</h1>
            </div>


            <div>
                <label className="block text-sm text-gray-800 mb-2">Product Name</label>
                <input
                placeholder="Value"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                value = {productName} onChange = {(e) => setProductName(e.target.value)}
                />
            </div>



            <div>
                <label className="block text-sm text-gray-800 mb-2">Price</label>
                <input
                placeholder="Value"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                value = {price} onChange = {(e) => setPrice(e.target.value)}
                />
            </div>



            <div>
                <label className="block text-sm text-gray-800 mb-2">Description</label>
                <input
                placeholder="Value"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                value = {description} onChange = {(e) => setDescription(e.target.value)}
                />
            </div>


            <div>
                <label className="block text-sm text-gray-800 mb-2">Inventory</label>
                <input
                placeholder="Value"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                value = {stock} onChange = {(e) => setStock(e.target.value)}
                />
            </div>



             <div>
                <label className="block text-sm text-gray-800 mb-2">Weight</label>
                <input
                placeholder="Value"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                value = {weight} onChange = {(e) => setWeight(e.target.value)}
                />
            </div>



            <div>
                <label className="block text-sm text-gray-800 mb-2">Category tag</label>
                <input
                placeholder="Value"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                value = {category} onChange = {(e) => setCategory(e.target.value)}
                />
            </div>


             <div>
                <label className="block text-sm text-gray-800 mb-2">Image</label>
                <label className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none flex items-center justify-center cursor-pointer flex items-center justify-center text-center">
                  {image ? image.name: "Click to upload an image"}
                  <input
                    type = "file"
                    accept = "image/*"
                    onChange = {(e) => setImage(e.target.files[0])}
                    className = "hidden"
                  />
                </label>
            </div>

          {/* Display success or error messages */}
            {error && (
               <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            {success && (
               <p className="text-green-600 text-sm text-center">{success}</p>
            )}

            <button onClick ={dBAddItem}
              disabled={loading}
              className={`w-full bg-zinc-800 text-white py-2 rounded-lg mt-2 transition ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"
              }`}
              >
                {loading ? "Adding Item..." : "Add Item"
              }
        
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

export default AdminCreateProduct;
