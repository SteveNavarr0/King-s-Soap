import supabase from "../supabaseClient.js";

export const getAllProducts = async (req, res) => {};

export const createProduct = async (req, res) => {
    try {
        console.log("Body:", req.body);
        console.log("Files:", req.files);

        if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "At least one image file is required" });
        }




        //Store the public DB URL created for each image
        const publicUrls = [];

        //Upload each selected image to Supabase
        
        //Create the unique URL for each image
        for (const [index, file] of req.files.entries()) {
            const filePath = `images/${Date.now()}-${index}-${file.originalname}`;

            //Ask DB to upload current image file
            const {error:uploadError} = await supabase.storage
                .from("Product Images")
                //Upload file to generated file path. Buffer contains the image data held in server memory
                .upload(filePath, file.buffer, {
                    //Tell DB file type
                    contentType: file.mimetype,
                });

            if (uploadError) {
                console.error("Could not upload image:", uploadError);

                return res.status(500).json({ message: "Failed to upload image to storage" });
        
            }


            // Get public URL for the uploaded image
            const { data: urlData } = supabase.storage.from("Product Images").getPublicUrl(filePath);
        
            publicUrls.push(urlData.publicUrl); 

        }



        // Insert product details into product table
        const { data: productData, error: productError } = await supabase.from("products").insert([{
            name: req.body.productName,
            price: req.body.price,
            description: req.body.description,
            stock: req.body.stock,
            weight: req.body.weight,
            category: req.body.category,
        },
    ])
    .select();

    if (productError) {
        console.error("Could not insert product into database:", productError);
        return res.status(500).json({ message: "Failed to insert product into database" });
    }

    console.log("Product inserted into database:", productData);

    // Get id of the newly created product
    const newProduct = productData[0];



    //Create database row for every uploaded image
    const imageRows = publicUrls.map((publicUrl) => ({
        product_id: newProduct.id,
        image_url: publicUrl,
    }));

    // Use id to insert image URL into the product image table
    const { data: imageData, error: imageError } = await supabase
        .from("product_images")
        .insert(imageRows);
           


        if (imageError) {
        console.error("Could not add image row to database:", imageError);
        return res.status(500).json({ message: "Failed to add image row to database" });
        }

        console.log("Image row added to database:", imageData);

    // Return success response with product id and image URL
    return res.status(201).json({ message: "Product created successfully", product_id: newProduct.id, imageUrls: publicUrls, },);
    }
    catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Internal server error" });
    }
    

};







//Add new images to an existing product
export const addProductImages = async (req, res) => {
    const { id } = req. params;

    console.log("Existing product ID:", id);
    console.log("New image files:", req.files);


//Stop if the request does not contain any image files
if (!req.files || req.files.length === 0) {
    return res.status(400).json({
        message: "At least one image upload is required",
    });
}


//Store the public URLs created for the newly uploaded images
const publicUrls =[];


 for (const [index, file] of req.files.entries()) {
            const filePath = `images/${Date.now()}-${index}-${file.originalname}`;

            //Ask DB to upload current image file
            const {error:uploadError} = await supabase.storage
                .from("Product Images")
                //Upload file to generated file path. Buffer contains the image data held in server memory
                .upload(filePath, file.buffer, {
                    //Tell DB file type
                    contentType: file.mimetype,
                });

            if (uploadError) {
                console.error("Could not upload image:", uploadError);

                return res.status(500).json({ message: "Failed to upload image to storage" });
        
            }


            // Get public URL for the uploaded image
            const { data: urlData } = supabase.storage.from("Product Images").getPublicUrl(filePath);
        
            publicUrls.push(urlData.publicUrl); 

 }


//Create one product_images row for every uploaded image URL
const imageRows = publicUrls.map((publicUrl) => ({
    product_id: id,
    image_url: publicUrl,
}));

//Connect the uploaded images to the existing product
const {data: imageData, error: imageError} = await supabase
    .from("product_images")
    .insert(imageRows)
    .select();





//Stop if the image rows couldn't be added
if (imageError) {
    console.error("Could not add image rows:", imageError);

    return res.status(500).json({
        message: "Failed to connect images to product",
    
    });
}

//Send the completed image records back to the frontend
return res.status(201).json({
    message: "Product images added successfully",
    images: imageData,
});

};









//Delete one existing image from a product
export const deleteProductImage = async (req, res) => {
    const { id, imageId } = req.params; //Id is the product and imageId is the id for the image

    //Find the selected image and confirm it belongs to the product
    const { data: imageData, error: findImageError } = await  supabase
        .from("product_images")
        .select("id, image_url")
        .eq("id", imageId)
        .eq("product_id", id)
        .single();


    //Stop if selected image could not be found
    if (findImageError) {
        console.error("Could not find product image:", findImageError);

        return res.status(404).json({
            message: "Product image not found",

        });
    }


    //Convert the public image URL into its supabase storage file path
    const decodedUrlPath = decodeURIComponent(
        new URL(imageData.image_url).pathname
    );

    const bucketPath = "/storage/v1/object/public/Product Images/";

    const filePath = decodedUrlPath.split(bucketPath)[1]; //Keeps shorter image path to delete file


    //Stop if the storage path could not be extracted from the public URL
    if (!filePath) {
        console.error("Could not determine image storage path"); //Error for backend terminal

        return res.status(500).json({
            message: "Could not determine image storage path", //For frontend browser
        });
    }


    //Delete the image file from supabase storage
    const { error: storageDeleteError } = await supabase.storage
        .from("Product Images")
        .remove([filePath]);



    //Stop if supabase storage could not delete the image file
    if (storageDeleteError) {
        console.error(
            "Could not delete image from storage:",
            storageDeletError
        );

        return res.status(500).json({
            message: "Unable to delete this image from storage",
        });
    }


    //Delete the image record from the product_images table
    const {error: deleteRowError } = await supabase
        .from("product_images")
        .delete()
        .eq("id", imageId)
        .eq("product_id", id);


    //Stop if the product_images db row could not be deleted
    if (deleteRowError) {
        console.error(
            "Could not delete image row:", deleteRowError);

        return res.status(500).json({
            message: "The image file was removed but it's db record could net be deleted",
        });
    }


    //Tell the frontend that the image was deleted successfully
    return res.status(200).json({
        message: "Product image deleted successfully",
        imageId: imageId,
    });
};







//Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    console.log("Deleting product:", productId);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Delete error:", error);

      return res.status(500).json({
        message: "Failed to delete product",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting product:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

