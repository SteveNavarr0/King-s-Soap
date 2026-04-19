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

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);

      // fetch one product plus its related images
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(id, image_url)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
        setLoading(false);
        return;
      }

      // save product data
      setProduct(data);

      // pull just the image_url values into a simple array
      const urls = data.product_images?.map((img) => img.image_url) || [];
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
  const handleAddToCart = () => {
    console.log("Add to cart clicked");
    console.log("Product:", product);
    console.log("Quantity:", quantity);
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
    // full-page wrapper with white background
    <div className="min-h-screen bg-white">
      {/* centered content container */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* top section: image area on left, product details on right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* LEFT COLUMN: main image + thumbnail images */}
          <div>
            {/* main product image */}
            {selectedImage ? (
              <div className="w-full mb-4">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full rounded-lg object-cover"
                />
              </div>
            ) : (
              // shown if the product has no images
              <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                No image available
              </div>
            )}

            {/* thumbnail image row */}
            <div className="flex gap-3 flex-wrap">
              {imageUrls.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  onClick={() => setSelectedImage(img)}
                  className="w-24 h-24 object-cover rounded cursor-pointer border"
                />
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: product title, price, description, etc. */}
          <div className="flex flex-col gap-4">
            {/* product name */}
            <h1 className="text-4xl font-bold">{product.name}</h1>

            {/* product price */}
            <p className="text-2xl font-semibold">
              ${Number(product.price).toFixed(2)}
            </p>

            {/* product description / ingredients */}
            <p className="text-gray-700 whitespace-pre-line">
                <span className="font-medium block mb-1">Ingredients</span>
                {product.description}
            </p>

            {/* product weight */}
            <p className="text-sm text-gray-500">
              Weight: {product.weight} oz
            </p>

            {/* product category */}
            <p className="text-sm text-gray-500">
              Category: {product.category}
            </p>

            {/* stock display */}
            <p className="text-sm">
              {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
            </p>



           {/* quantity selector */}
           <div className="mt-2">
              <p className="text-sm font-medium mb-2">Quantity</p>

              <div className="inline-flex items-center border rounded-lg overflow-hidden">
                {/* minus button */}
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="px-4 py-2 text-lg border-r disabled:opacity-40"
                >
                  -
                </button>

                {/* current quantity */}
                <div className="px-5 py-2 min-w-[60px] text-center">
                  {quantity}
                </div>

                {/* plus button */}
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                  className="px-4 py-2 text-lg border-l disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* add to cart button */}
            <button
  onClick={handleAddToCart}
  disabled={product.stock <= 0}
  className="mt-4 self-start inline-flex items-center gap-2 whitespace-nowrap bg-black text-white px-4 py-2 rounded-lg text-sm disabled:bg-gray-400"
>
  <span>Add {quantity} to Cart</span>
  <BsBag className="text-lg shrink-0" />
</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;