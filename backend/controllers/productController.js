import supabase from "../supabaseClient.js";

export const getAllProducts = async (req, res) => {};

export const createProduct = async (req, res) => {
    try {
        console.log("Body:", req.body);
        console.log("File:", req.file);

        if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
        }

        // Create a unique file path for the image
        const filePath = `images/${Date.now()}-${req.file.originalname}`; 
        
        // Upload image to Supabase storage
        const { error: uploadError } = await supabase.storage.from("Product Images").upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
        }); 

        if (uploadError) {
        console.error("Could not upload image to storage:", uploadError);
        return res.status(500).json({ message: "Failed to upload image to storage" });
        }

        console.log("Image uploaded to storage:", filePath);

        // Get public URL for the uploaded image
        const { data: urlData } = supabase.storage.from("Product Images").getPublicUrl(filePath);
       
        const publicUrl = urlData.publicUrl;
        console.log("Public URL:", publicUrl);  

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

    // Use id to insert image URL into the product image table
    const { data: imageData, error: imageError } = await supabase
        .from("product_images")
        .insert([
            {
            product_id: newProduct.id,
            image_url: publicUrl,
            },
        ]);

        if (imageError) {
        console.error("Could not add image row to database:", imageError);
        return res.status(500).json({ message: "Failed to add image row to database" });
        }

        console.log("Image row added to database:", imageData);

    // Return success response with product id and image URL
    return res.status(201).json({ message: "Product created successfully", product_id: newProduct.id, imageUrl: publicUrl, },);
    }
    catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Internal server error" });
    }
        



};