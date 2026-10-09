import {useEffect, useState } from "react";
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
const AdminUpdateProduct = ({
  productId,
  onClose,
  onProductChanged,
}) => {
  
  const id = productId; // Get the product ID from the page that opened popup

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [weight, setWeight] = useState("");
  const [category, setCategory] = useState([]);// change to array, maybe change how we are storing in the db?
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImageOrders, setNewImageOrders] = useState([]);
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
        .select("name, price, description, stock, weight, category, product_images(id, image_url, display_order)")
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
      //Arrange from Main to last
      setExistingImages(
        [...(data.product_images || [])].sort( //Copy array > ...
          (firstImage, secondImage) =>
            firstImage.display_order - secondImage.display_order //Numeric comparison
        )
        .map((image, index) => ({
          ...image,
          display_order: index + 1,
        }))
      );
    
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

    //Save image display order in DB through Promise.all
    const imageOrderResults = await Promise.all( 
      existingImages.map((image) =>
      supabase
        .from("product_images")
        .update({
          display_order: image.display_order,
        })
        .eq("id", image.id)
      
      )
    );

    //Check if iamge order update failed
    const failedOrderUpdate = imageOrderResults.find(
      (result) => result.error
    );

    if (failedOrderUpdate) {
      console.error(
        "Error updating image order:",
        failedOrderUpdate.error
      );
      setError("Unable to save the image order.");
      return;

    }



    //Send image request if user selected > 0 image
    if (newImages.length >0) {
      const imageFormData = new FormData(); //FormData object to hold the image files

      newImages.forEach((image) => {
        imageFormData.append("images", image); //Loop through new images and add to formData
      });


      //Send each new image's selected display pos
      imageFormData.append(
        "displayOrders",
        JSON.stringify(newImageOrders) //Convert array to JSON string
      );
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

      //Clear the newly selected files and their temp pos
      setNewImages([]);
      setNewImageOrders([]);


      console.log("Image endpoint response:", imageResult);
    
    }


    setSuccess("Product updated successfully.");

    //Tell page to retrieve updated product info
    onProductChanged(); 

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


  //Remove the deleted image and renumber the remaining images
  const reorderedRemainingImages = existingImages
    .filter(
      (existingImage) =>
        existingImage.id !== imageToDelete.id //Is existingImage's id different from imageToDelete's id
    )
    .sort(
      (firstImage, secondImage) =>
        firstImage.display_order -
      secondImage.display_order
    )
    .map((image, index) => ({
      ...image,
      display_order: index + 1,
    }));

    setExistingImages(reorderedRemainingImages);

    //Save each remaining image's new position to Supabase
    const orderUpdateResults = await Promise.all(
      reorderedRemainingImages.map((image) =>
      supabase
        .from("product_images")
        .update({
          display_order: image.display_order,
        })
        .eq("id", image.id)
    )
  );

  //Find the first failed image order update
  const failedOrderUpdate = orderUpdateResults.find(
    (result) => result.error
  );

  if (failedOrderUpdate) {
    console.error(
      "Could not renumber images after deletion:",
      failedOrderUpdate.error
    );

    setError(
      "The image was deleted, but the remaining image order could not be saved"
    );

    return;
  }


};



const deleteProduct = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmed) {
    return;
  }

  setLoading(true);
  setError("");
  setSuccess("");

  try {
    const { error: deleteError } = await supabase
      .from("products")
      .update({
        is_active: false,
      })
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting product:", deleteError);
      setError("Unable to delete product.");
      return;
    }

    // Soft delete succeeded
    setSuccess("Product deleted successfully.");

    //Tells page to retrieve its updated product list
    onProductChanged();

    onClose();



  } catch (error) {
    console.error("Error deleting product:", error);
    setError("Unable to delete product.");

  } finally {
    setLoading(false);
  }
};





      //Admin Update Product container
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60">
            <div className="min-h-full flex justify-center pt-16 pb-8 md:pt-12 md:pb-12">
              <div className="w-full max-w-lg h-fit rounded-lg bg-[#C5AE98] p-8">          
                
                <button
                  type="button"
                  onClick={onClose}
                  className="float-right text-2xl text-white cursor-pointer"
                >
                  ×
                </button>

        <h2 className="text-4xl md:text-4xl text-center font-serif text-white">
          {productName}
        </h2>




        {/* Update a Product container*/}
        <div className="w-full max-w-md mx-auto p-6 pb-12 rounded-2xl md:border md:border-white/30 md:shadow-lg bg-[#C5AE98]/20 backdrop-blur-lg md:mt-8 md:mb-8">            
          <div className="space-y-4">

            <div>
                <label className="block text-lg md:text-xl font-serif text-white mb-2">Product Name</label>
                
                <div className="relative">

                  {/*Read only unless pencil has been clicked. Lock when clicking outside the box*/}
                  <textarea
                  placeholder="Value"
                  className="w-full bg-white rounded-lg px-3 py-2 pr-10 font-sans text-gray-800 placeholder-gray-400 outline-none outline-none resize-none overflow-hidden [field-sizing:content]"
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
                <label className="block text-lg md:text-xl font-serif text-white mb-2">Price</label>
                
                 <div className="relative">
                <input
                placeholder="Value"
                className="w-full bg-white rounded-lg px-3 py-2 font-sans text-gray-800 placeholder-gray-400 outline-none"
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
                <label className="block text-lg md:text-xl font-serif text-white mb-2">Description</label>
                
                <div className="relative">
                <textarea
                placeholder="Value"
                className="w-full bg-white rounded-lg px-3 py-2 font-sans text-gray-800 placeholder-gray-400 outline-none outline-none resize-none overflow-hidden [field-sizing:content]"
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
                <label className="block text-lg md:text-xl font-serif text-white mb-2">Inventory</label>
                
                <div className="relative">
                <input
                placeholder="Value"
                className="w-full bg-white rounded-lg px-3 py-2 font-sans text-gray-800 placeholder-gray-400 outline-none"
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
                <label className="block text-lg md:text-xl font-serif text-white mb-2">Weight</label>
                
                <div className="relative">
                <input
                placeholder="Value"
                className="w-full bg-white rounded-lg px-3 py-2 font-sans text-gray-800 placeholder-gray-400 outline-none"
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
                <label className="block text-lg md:text-xl font-serif text-white mb-2">Category tag</label>
            <details className="relative">
            <summary className="w-full bg-white rounded-lg px-3 py-2 font-sans text-gray-700 cursor-pointer list-none">
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
                <label className="block text-lg md:text-xl font-serif text-white mb-2">
                  Images
                </label>

                <AdminImageManager
                  newImages={newImages}
                  setNewImages={setNewImages}
                  newImageOrders={newImageOrders}
                  setNewImageOrders={setNewImageOrders}
                  existingImages={existingImages}
                  setExistingImages={setExistingImages}
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
              className={`mt-8 w-full py-2 md:h-10 rounded-lg bg-[#8B6B4A] border border-white/30 shadow-sm text-white text-md md:text-xl flex items-center justify-center hover:scale-105 cursor-pointer transition ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"
              }`}
              >
                {loading ? "Saving Changes..." : "Save Changes"
              }
        
            </button>


            {/*Delete product functionality goes here*/}
            <button onClick ={deleteProduct}
              disabled={loading}
              className={`mt-8 w-full py-2 md:h-10 rounded-lg bg-white/15 border border-white/30 shadow-sm text-white text-md md:text-xl flex items-center justify-center hover:scale-105 cursor-pointer transition ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"
              }`}
              >
                {loading ? "Deleting Product..." : "Delete Product"
              }
        
            </button>



               </div>
          </div>
        </div>
      </div>
    </div>
  );
    
  
};

export default AdminUpdateProduct;
