import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BsBag } from "react-icons/bs";
import supabase from "../supabaseClient";

const ProductPage = () => {
  // gets the product id from the route, example: /product/1
  const { id } = useParams();

  // stores the product info from the products table
  const [product, setProduct] = useState(null);

  // stores all image URLs for this product
  const [imageUrls, setImageUrls] = useState([]);

  // stores the currently selected main image
  const [selectedImage, setSelectedImage] = useState("");

  // controls loading state while data is being fetched
  const [loading, setLoading] = useState(true);

  // stores how many items the user wants to buy
  const [quantity, setQuantity] = useState(1);

  // scroll to the top whenever a product page opens.
  useEffect(() => {
  window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);

      // fetch one product plus its related images
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(id, image_url, display_order)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
        setLoading(false);
        return;
      }

       //Sort this product's images from Main to last
        const orderedImages = [...(data.product_images || [])].sort(
              (firstImage, secondImage) =>
                firstImage.display_order -
                secondImage.display_order
            );
        
      //Store the product with its ordered image records
      setProduct({
        ...data,
        product_images: orderedImages,
      }); 
    

      // pull just the image_url values into a simple array
      const urls = orderedImages.map((image) => image.image_url);
      setImageUrls(urls);

      // set the first image as the main displayed image
      setSelectedImage(urls[0] || "");

      setQuantity(1);

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  // lowers quantity, but never below 1
  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  // raises quantity, but never above available stock
  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(product.stock, prev + 1));
  };

  //  cart handler
  const handleAddToCart = async() => {
    if (!product || product.stock <=0) return;
    //check the session 
    const {
      data: { user },
       error: userError,
      }  = await supabase.auth.getUser();

   const selectedQuantity = Math.max(
      1,
      Math.min(quantity, product.stock)
    );

      //guest user not logged in
      if (!user) {
        const existingCart = JSON.parse(localStorage.getItem("guestCart") || "[]");

        const existingItemIndex = existingCart.findIndex((item) => item.id === product.id);

        if (existingItemIndex > -1) {
          const currentInCart = existingCart[existingItemIndex].quantity;
          const newTotalQuantity = Math.min(currentInCart + quantity, Number(product.stock));
          existingCart[existingItemIndex].quantity = newTotalQuantity;
        } else {
          existingCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: Math.min(quantity, Number(product.stock)),
            image: selectedImage,
            stock: Number(product.stock),
          });
        }

        localStorage.setItem("guestCart", JSON.stringify(existingCart));
        console.log(`Added ${quantity} of ${product.name} to guest cart.`);
        return;
        }

    const { data: existingItem, error: fecthError } = await supabase
      .from("cart")
      .select("*")
      .eq("user_ID", user.id)
      .eq("product_ID", product.id)
      .maybeSingle();
    
    if (fecthError) {
      console.error("Error fetching cart item:", fecthError);
      return;
    }

    if (existingItem) {
      // If the item already exists in the cart, update its quantity
      const newQuantity = Math.min(
        existingItem.quantity + selectedQuantity,
        product.stock
      );

      const { error: updateError } = await supabase
        .from("cart")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id)
        .eq("user_ID", user.id);

      if (updateError) {
        console.error("Error updating cart item:", updateError);
      }
    } else {
      // If the item does not exist in the cart, insert it
      const { error: insertError } = await supabase
      .from("cart")
      .insert([
        {
          user_ID: user.id,
          product_ID: product.id,
          quantity: selectedQuantity,
        },
      ]);

      if (insertError) {
        console.error("Error adding item to cart:", insertError);
      }
    }   

    console.log(`Added ${selectedQuantity} of ${product.name} to cart.`);
    
  };
  // loading screen
  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  // error message if no product was found
  if (!product) {
    return <div className="text-center mt-10">Product not found.</div>;
  }

  return (
    // full-page wrapper with tan background
    <div className="bg-[#C5AE98] px-4 pt-28 md:pt-32">

      {/* centered white product box */}
      <div className="mx-auto max-w-5xl rounded-lg bg-white px-10 py-10 md:max-w-[640px] lg:max-w-5xl">
        {/* top section: image area on left, product details on right */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          
          {/* LEFT COLUMN: main image + thumbnail images */}
          <div className="mx-auto w-full max-w-[600px] lg:mx-0 lg:max-w-none">
             {/* main product image */}
            {selectedImage ? (
              <div className="mb-4 h-[250px] w-full overflow-hidden rounded-lg sm:h-[380px] md:h-[400px]">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full rounded-lg object-cover"
                />
              </div>
            ) : (
              // shown if the product has no images
              <div className="w-full h-60 bg-gray-200 font-sans rounded-lg flex items-center justify-center mb-4">
                No image available
              </div>
            )}

            {/* thumbnail image row */}
            <div
              className={`flex flex-wrap gap-3 ${
                imageUrls.length >= 3 ? "justify-between" : "justify-start"
              }`}
            >
              {imageUrls.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  onClick={() => setSelectedImage(img)}
                  className="aspect-square w-[calc((100%-1.5rem)/3)] object-cover rounded-lg cursor-pointer md:aspect-auto md:w-35 md:h-35"
                />
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: product title, price, description, etc. */}
          <div className="flex flex-col gap-4 md:gap-3">
            {/* product name */}
            <h1 className="font-serif text-3xl md:text-5xl">{product.name}</h1>

            {/* product price */}
            <p className="font-sans text-lg md:text-xl">
              ${Number(product.price).toFixed(2)}
            </p>

            {/* product description / ingredients */}
            <p className="whitespace-pre-line font-sans text-base leading-relaxed text-gray-800 md:text-lg">
              <span className="mb-1 block font-serif text-lg md:text-xl">
                Ingredients
              </span>
              {product.description}
            </p>

            {/* product weight */}
            <p className="whitespace-pre-line font-sans text-base leading-relaxed text-gray-800 md:text-lg">
              <span className="mb-1 block font-serif text-lg md:mr-2 md:mb-0 md:inline md:text-xl">
                Weight:
              </span>
              {product.weight} oz
            </p>

            {/* product category */}
            <p className="whitespace-pre-line font-sans text-base leading-relaxed text-gray-800 md:text-lg">
              <span className="mb-1 block font-serif text-lg md:mr-2 md:mb-0 md:inline md:text-xl">
                Category:
              </span>
              {product.category}
            </p>

            {/* stock display */}
            <p className="font-sans text-sm md:text-base text-gray-800">
              {product.stock === 0
              ? "Out of Stock"
              : product.stock > 4
              ? `In Stock (${product.stock})`
              : `Limited Stock! (${product.stock})`
              }
            </p>



            {/* quantity selector */}
            <div className="mt-2">
              <p className="mb-2 font-serif text-lg text-gray-800 md:text-xl">
                Quantity
              </p>

              <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-300 font-sans text-gray-800">
                {/* minus button */}
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="cursor-pointer border-r border-gray-300 px-4 py-2 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>

                {/* current quantity */}
                <div className="min-w-[60px] px-5 py-2 text-center">
                  {quantity}
                </div>

                {/* plus button */}
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                  className="cursor-pointer border-l border-gray-300 px-4 py-2 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

             {/* add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="mt-4 inline-flex items-center gap-2 self-start whitespace-nowrap rounded-lg border border-white/30 bg-[#8B6B4A] px-4 py-2 font-sans text-base text-white cursor-pointer transition duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 md:text-lg"
            >
              <span>Add {quantity} to Cart</span>
              <BsBag className="shrink-0 text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;