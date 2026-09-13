import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

function OldUIAdminDeleteProduct() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, description, stock, weight, category, product_images(image_url)");

      setProducts(data);
    };

    fetchProducts();
  }, []);

  const dbDeleteItem = async () => {


    //Make sure all fields are valid
    setSuccess("");
    setError("");

    if (!selectedProduct?.id){
      setError("Please select a product to delete")
      return;
    }


    setLoading(true);

    //Send the id to be deleted to the backend
      try {
        const response = await fetch(`http://localhost:3000/api/products/${selectedProduct?.id}`, {
          method: "DELETE",
        });

        const result = await response.json();
        console.log("Backend response:", result);

        if (!response.ok) {
          setError(result.message || "Failed to delete product");
          return;
        }
        
        //Remove deleted product from list of products that can be selected 
        setProducts((products) =>
          products.filter((product) => product.id !== selectedProduct.id)
        );
      
        // Show success message and clear form after a delay. Don't allow double submission
        setSuccess("Product deleted successfully!");
        
      } catch (err) {
        console.error("Delete error:", err);
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
          <h1 className="text-xl font-semibold">Admin - Delete Item</h1>
        </div>
      </div>
      {/* Button Grid */}
      <div className="flex justify-center gap-24 mt-8">
        
        {/* Delete a Product From Shop left box*/}
        <Link to="/adminDeleteProduct">
        <div
          className="w-120 h-120 bg-[#c4b5a5] flex items-center justify-center cursor-pointer hover:scale-105 transition"
        >
          <div className="flex flex-col items-center text-center -mt-10">
            
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

          </div>
        </div>
        </Link>

        {/* Delete a Product From Shop right box*/}
        <div className="w-full max-w-md bg-grey p-6 pb-12 rounded-2xl shadow-sm">
            <div className="space-y-4">
            <div className=" text-center">
                <h1 className="text-xl font-semibold">Delete Item From Shop</h1>
            </div>
            <div>
                <label className="block text-sm text-gray-800 mb-2">Select Item to Delete</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-grey text-gray-700 outline-none"
                  {/* Set selected product*/}
                  onChange={(e) => {
                    const product = products.find(
                      (p) => p.id.toString() === e.target.value
                    );
                    setSelectedProduct(product);
                  }}
                  >
                    {/* Populate dropdown with product names */}
                    <option value="">Select a product</option>
                    {products.map((product) =>(
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                </select>
            </div>

            {/* Line */}
            <div className="border-t-4 border-black"></div>

            <div>
                <label className="block text-sm text-gray-800 mb-2">Product Name</label>
                <input
                placeholder="Value"
                readOnly
                value={selectedProduct?.name || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-800 mb-2">
                Image
                </label>
                <input
                placeholder="Value"
                readOnly
                value={selectedProduct?.product_images?.[0]?.image_url|| ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-800 mb-2">Price</label>
                <input
                placeholder="Value"
                readOnly
                value={selectedProduct?.price || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-800 mb-2">Description</label>
                <input
                placeholder="Value"
                readOnly
                value={selectedProduct?.description || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-800 mb-2">Category tag</label>
                <input
                placeholder="Value"
                readOnly
                value={selectedProduct?.category || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                />
            </div>
          
            {/* Display success or error messages */}
            {error && (
               <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            {success && (
               <p className="text-green-600 text-sm text-center">{success}</p>
            )}

            <button onClick ={dbDeleteItem}
              disabled={loading}
              className={`w-full bg-zinc-800 text-white py-2 rounded-lg mt-2 transition ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"
              }`}
              >
                {loading ? "Deleting Item..." : "Delete Item"
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

export default OldUIAdminDeleteProduct;
