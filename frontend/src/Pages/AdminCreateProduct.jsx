import { useState } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminNav from "../components/AdminNav";
import AdminImageManager from "../components/AdminImageManager";
const categoryOptions = [
  "Coconut Oil",
  "All Natural",
  "Organic",
  "Lip Balm",
  "Soap Dish",
]; // restrict category options for easier filtering when adding an item


//Function to add all fields to the database
function AdminCreateProduct() {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [weight, setWeight] = useState("");
  const [category, setCategory] = useState([]);// change to array, maybe change how we are storing in the db?
  const [newImages, setNewImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const toggleCategory = (selectedCategory) => { // checks whether or not the category has already been selected 
  if (category.includes(selectedCategory)) { //means the category has already been selected
    setCategory(
      category.filter((category) => category !== selectedCategory) // Removes the selected category
    );
  } else {
    setCategory([...category, selectedCategory]); // sets the selected categories
  }
  };
  
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

    if (newImages.length === 0) {
      setError("Please upload at least one image for the product");
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
      formData.append("category", category.join(", ")); // split text for db handling


      //Loops through selected files and adds to formData
      newImages.forEach((image) => {
        formData.append("images", image);
      });

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
          setCategory([]);//changed to set for array
          setNewImages([]);
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

    
    <div className="min-h-screen pb-16">
      
      <AdminHeader />
      
      <div className="flex flex-col justify-left mt-4 md:mt-8 ml-8 md:ml-13 text-white">

        <h1 className="text-3xl md:text-5xl font-serif">
          Add a New Product
        </h1>
      </div>

        {/* Create a Product From Shop right box*/}
        <div className="w-full max-w-md mx-auto p-6 pb-12 rounded-2xl md:border md:border-white/30 md:shadow-lg bg-[#C5AE98]/20 backdrop-blur-lg mt-2 md:mt-12 md:mb-24">
            
          <div className="space-y-4">

            <div>
                <label className="block text-md md:text-2xl text-white mb-2">Product Name</label>
                <input
                placeholder="Value"
                className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                value = {productName} onChange = {(e) => setProductName(e.target.value)}
                />
            </div>



            <div>
                <label className="block text-md md:text-2xl text-white mb-2">Price</label>
                <input
                placeholder="Value"
                className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                value = {price} onChange = {(e) => setPrice(e.target.value)}
                />
            </div>



            <div>
                <label className="block text-md md:text-2xl text-white mb-2">Description</label>
                <input
                placeholder="Value"
                className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                value = {description} onChange = {(e) => setDescription(e.target.value)}
                />
            </div>


            <div>
                <label className="block text-md md:text-2xl text-white mb-2">Inventory</label>
                <input
                placeholder="Value"
                className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                value = {stock} onChange = {(e) => setStock(e.target.value)}
                />
            </div>



             <div>
                <label className="block text-md md:text-2xl text-white mb-2">Weight</label>
                <input
                placeholder="Value"
                className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                value = {weight} onChange = {(e) => setWeight(e.target.value)}
                />
            </div>



            <div>
            <label className="block text-md md:text-2xl text-white mb-2">
              Category tags
            </label>
            <details className="relative">
            <summary className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 cursor-pointer list-none">
            {category.length > 0 ? category.join(", ") : "Select"} {/*Checks whether or not any categories have been selected, displays them */}
            </summary>
            <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg overflow-hidden">
              {/*Loop through every option in category options */}
            {categoryOptions.map((option) => (
           <label key={option} 
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer"
           ><input 
            type="checkbox"
            checked={category.includes(option)}
            onChange={() => toggleCategory(option)} 
            className="h-4 w-4"
          />
            <span>{option}</span> {/*Display category name */}
            </label>
            ))}
            </div>
            </details>
            </div>


             <div>
                <label className="block text-md md:text-2xl text-white mb-2">
                  Images
                  </label>

                {/*Passes array of currently selected images into component to display them and saves them using setNewImages*/}
                <AdminImageManager
                  newImages={newImages}
                  setNewImages={setNewImages}
                />
            </div>

          {/* Display success or error messages */}
            {error && (
               <p className="text-red-600 text-sm md:text-xl text-center">{error}</p>
            )}

            {success && (
               <p className="text-green-600 text-sm md:text-xl text-center">{success}</p>
            )}

            <button onClick ={dBAddItem}
              disabled={loading}
              className={`mt-8 w-full py-2 md:h-10 rounded-lg bg-[#8B6B4A] backdrop-blur-lg border border-white/30 shadow-sm text-white text-md md:text-2xl flex items-center justify-center hover:scale-105 cursor-pointer transition ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"
              }`}
              >
                {loading ? "Adding Item..." : "Add Item"
              }
        
            </button>



            </div>
        </div>

      <AdminNav />

      </div>

  );
}

export default AdminCreateProduct;
