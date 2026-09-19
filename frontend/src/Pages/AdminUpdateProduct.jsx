import {useParams} from "react-router-dom";
import {useEffect, useState } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminNav from "../components/AdminNav";
import supabase from "../supabaseClient";
import { FiEdit2 } from "react-icons/fi";
import AdminImageManager from "../components/AdminImageManager";
const categoryOptions = [
  "Coconut Oil",
  "All Natural",
  "Organic",
  "Lip Balm",
  "Soap Dish",
];


//Pulled from AdminCreateProduct.jsx
const AdminUpdateProduct = () => {
  const {id} = useParams(); // Get the product ID from the URL parameters

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [weight, setWeight] = useState("");
  const [category, setCategory] = useState([]);// change to array, maybe change how we are storing in the db?
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState(null) //Will determine which is editable
  const toggleCategory = (selectedCategory) => { // checks whether or not the category has already been selected 
    if (category.includes(selectedCategory)) { //means the category has already been selected
      setCategory(
        category.filter((category) => category !== selectedCategory) // Removes the selected category
      );
    } else {
      setCategory([...category, selectedCategory]); // sets the selected categories
    }
    };

  useEffect(() => {
    const fetchProduct = async () => {
      setError("");

      const {data, error: fetchError} = await supabase
        .from("products")
        .select("name, price, description, stock, weight, category, product_images(id, image_url)")
        .eq("id", id) //Based on matching id
        .single(); //Retun one instead of the whole array
      
      //Error handling
      if (fetchError) {
        console.error("Error fetching product:", fetchError);
        setError("unable to load this product.");
        return;
      }

      //Fill form fields with data from DB
      setProductName(data.name || "");
      setPrice(
        data.price !== null && data.price !== undefined
          ? Number(data.price).toFixed(2)
          : ""
      );
      setDescription(data.description || "");
      setStock(data.stock ?? "");
      setWeight(data.weight ?? "");
      setCategory(data.category ? data.category.split(",").map((item) => item.trim()): []);
      setExistingImages(data.product_images || []);
    
    };

    fetchProduct();

  }, [id]);



  // Actual updateProduct function


  const updateProduct = async () => { //Creates a function called updateProduct. Asynch allows it to wait for the db request
    const updatedProduct = { //Creates object only when function runs. Updated product stores values to be sent to DB
      name: productName.trim(),
      price: Number(price).toFixed(2),
      description: description.trim(),
      stock: Number(stock),
      weight: Number(weight),
      category: category.join(","),
    };

    //Supabase update query
    const {error: updateError} = await supabase
      .from("products") //Products table in DB
      .update(updatedProduct) //Replace fields with updated ones in object
      .eq("id", id); //Row matching ID

    if (updateError) {
      console.error("Error updating product:", updateError);
      setError("Unable to save changes.");
      return;
    }

    //Send image request if user selected > 0 image
    if (newImages.length >0) {
      const imageFormData = new FormData(); //FormData object to hold the image files

      newImages.forEach((image) => {
        imageFormData.append("images", image); //Loop through new images and add to formData
      });

      //Send to backend
      const imageResponse = await fetch(
         `http://localhost:3000/api/products/${id}/images`,
        {
          method: "POST",
          body: imageFormData, //Send body with all selected image files
        }
      );

      const imageResult = await imageResponse.json(); //Convert backend response to Javascript object

      if (!imageResponse.ok) {
        console.error("Error adding product images:", imageResult);
        setError(imageResult.message || "Unable to add product images.");
        return;
      }

      //Add the newly saved image records to the displayed image list
      setExistingImages((currentImages) => [
        ...currentImages,
        ...imageResult.images,
      ]);

      //Clear the newly selected files now that they are uploade
      setNewImages([]);


      console.log("Image endpoint response:", imageResult);
    
    }


    setSuccess("Product updated successfully.");
    setTimeout(() => {
      setSuccess("");
    }, 3000);


    console.log("Product ID:", id);
    console.log("Updated values:", updatedProduct);
  };
  



  //Begin deleting one existing product image
  const deleteExistingImage = async (imageToDelete) => {
    //Ask for confirmation
    const confirmed = window.confirm( "Are you sure you want to delete this image?");

    //Stop if user clicks cancel
    if (!confirmed) {
      return;
    }

    //Ask the backend to delete the image
    const deleteResponse = await fetch(
      `http://localhost:3000/api/products/${id}/images/${imageToDelete.id}`,
      {
        method: "DELETE",
      }
    );


  //Convert the backend response into a Javascript object
  const deleteResult = await deleteResponse.json();

  //Stop and give error if backend could not delete image
  if (!deleteResponse.ok) {
    console.error("Error deleting product image:", deleteResult);

    setError(
      deleteResult.message || "Unable to delete this image."
  
    );

    return;

  }

  //Remove image from the displayed existing-images array
  setExistingImages((currentImages) =>
    currentImages.filter(
      (existingImage) => existingImage.id != imageToDelete.id //Render ones not selected for deletion
    )
  );

  };

  const deleteProduct = () => {
  console.log("Delete product:", id);
};




      //Admin Update Product container
      return (
        <div className="min-h-screen pb-16">
          
         

           <AdminHeader />
      
      <div className="flex flex-col justify-left mt-4 md:mt-8 ml-8 md:ml-13 text-white">

        <h1 className="text-3xl md:text-5xl font-serif">
          {productName}
        </h1>
      </div>

        {/* Update a Product container*/}
        <div className="w-full max-w-md mx-auto p-6 pb-12 rounded-2xl md:border md:border-white/30 md:shadow-lg bg-[#C5AE98]/20 backdrop-blur-lg mt-2 md:mt-12 md:mb-24">
            
          <div className="space-y-4">

            <div>
                <label className="block text-md md:text-xl text-white mb-2">Product Name</label>
                
                <div className="relative">

                  {/*Read only unless pencil has been clicked. Lock when clicking outside the box*/}
                  <textarea
                  placeholder="Value"
                  className="w-full bg-white rounded-lg px-3 py-2 pr-10 text-gray-800 placeholder-gray-400 outline-none outline-none resize-none overflow-hidden [field-sizing:content]"
                  value = {productName} onChange = {(e) => setProductName(e.target.value)}
                  readOnly = {editingField !== "name"} 
                  onBlur={() => setEditingField(null)}
                  />

                  <button
                    type="button"
                    onClick={() => setEditingField("name")}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer ${
                      editingField === "name"
                      ? "text-gray-800"
                      : "text-gray-500"
                    }`}
                    aria-label="edit product name"
                  >
                    <FiEdit2/> {/*Icon for editing*/}
                  </button>

                </div>

            </div>



            <div>
                <label className="block text-md md:text-xl text-white mb-2">Price</label>
                
                 <div className="relative">
                <input
                placeholder="Value"
                className="w-full bg-white rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 outline-none"
                value = {price} onChange = {(e) => setPrice(e.target.value)}
                readOnly = {editingField !== "price"}
                onBlur={() => setEditingField(null)} 
                  />

                  <button
                    type="button"
                    onClick={() => setEditingField("price")}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer ${
                      editingField === "price"
                      ? "text-gray-800"
                      : "text-gray-500"
                    }`}
                    aria-label="edit price"
                  >
                    <FiEdit2/> {/*Icon for editing*/}
                  </button>

                </div>
            </div>



            <div>
                <label className="block text-md md:text-xl text-white mb-2">Description</label>
                
                <div className="relative">
                <textarea
                placeholder="Value"
                className="w-full bg-white rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 outline-none outline-none resize-none overflow-hidden [field-sizing:content]"
                value = {description} onChange = {(e) => setDescription(e.target.value)}
                readOnly = {editingField !== "description"} 
                onBlur={() => setEditingField(null)}
                  />

                  <button
                    type="button"
                    onClick={() => setEditingField("description")}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer ${
                      editingField === "description"
                      ? "text-gray-800"
                      : "text-gray-500"
                    }`}
                    aria-label="edit description"
                  >
                    <FiEdit2/> {/*Icon for editing*/}
                  </button>

                </div>
            </div>


            <div>
                <label className="block text-md md:text-xl text-white mb-2">Inventory</label>
                
                <div className="relative">
                <input
                placeholder="Value"
                className="w-full bg-white rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 outline-none"
                value = {stock} onChange = {(e) => setStock(e.target.value)}
                readOnly = {editingField !== "stock"} 
                onBlur={() => setEditingField(null)}
                  />

                  <button
                    type="button"
                    onClick={() => setEditingField("stock")}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer ${
                      editingField === "stock"
                      ? "text-gray-800"
                      : "text-gray-500"
                    }`}
                    aria-label="edit stock"
                  >
                    <FiEdit2/> {/*Icon for editing*/}
                  </button>

                </div>
            </div>



             <div>
                <label className="block text-md md:text-xl text-white mb-2">Weight</label>
                
                <div className="relative">
                <input
                placeholder="Value"
                className="w-full bg-white rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 outline-none"
                value = {weight} onChange = {(e) => setWeight(e.target.value)}
                readOnly = {editingField !== "weight"}
                onBlur={() => setEditingField(null)} 
                  />

                  <button
                    type="button"
                    onClick={() => setEditingField("weight")}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer ${
                      editingField === "weight"
                      ? "text-gray-800"
                      : "text-gray-500"
                    }`}
                    aria-label="edit weight"
                  >
                    <FiEdit2/> {/*Icon for editing*/}
                  </button>

                </div>
            </div>



            <div>
                <label className="block text-md md:text-xl text-white mb-2">Category tag</label>
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


             {/*Give component newly selected and existing images to update selection*/}
             <div>
                <label className="block text-md md:text-xl text-white mb-2">
                  Images
                </label>

                <AdminImageManager
                  newImages={newImages}
                  setNewImages={setNewImages}
                  existingImages={existingImages}
                  onDeleteExisting={deleteExistingImage}
                />
            </div>



          {/*Display success or error messages*/}
            {error && (
               <p className="text-red-600 text-md md:text-xl text-center">{error}</p>
            )}

            {success && (
               <p className="text-green-600 text-md md:text-xl text-center">{success}</p>
            )}


            {/*Run updateProduct function on click*/}
            <button onClick ={updateProduct}
              disabled={loading}
              className={`mt-8 w-full py-2 md:h-10 rounded-lg bg-[#8B6B4A] backdrop-blur-lg border border-white/30 shadow-sm text-white text-md md:text-xl flex items-center justify-center hover:scale-105 cursor-pointer transition ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"
              }`}
              >
                {loading ? "Saving Changes..." : "Save Changes"
              }
        
            </button>


            {/*Delete product functionality goes here*/}
            <button onClick ={deleteProduct}
              disabled={loading}
              className={`mt-8 w-full py-2 md:h-10 rounded-lg bg-white/15 backdrop-blur-lg border border-white/30 shadow-sm text-white text-md md:text-xl flex items-center justify-center hover:scale-105 cursor-pointer transition ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"
              }`}
              >
                {loading ? "Deleting Product..." : "Delete Product"
              }
        
            </button>



            </div>
        </div>

      <AdminNav />

      </div>
      );
    
  
};

export default AdminUpdateProduct;
