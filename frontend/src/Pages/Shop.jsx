import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../supabaseClient";
import ShopPageImage from "../components/ShopPageImage";
import FilterBar from "../components/FilterBar";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [notification, setNotification] = useState({message: "", type: "success"}); // State for notification message and type

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "success" }); // Clear notification after 3 seconds
    }, 3000); //Disappears after 3 seconds
  }

  useEffect(() => {
    const fetchProducts = async () => {

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, product_images(image_url, display_order)")
        .eq("Availability", true);//Only fetch products that are currently active

      if (error) {
        console.error("Error fetching products:", error);
        return;
      }
       //Sort each product's images from Main to last
        const productsWithOrderedImages = (data || []).map(
          (product) => ({
            ...product,
            product_images: [...(product.product_images || [])].sort(
              (firstImage, secondImage) =>
                firstImage.display_order -
              secondImage.display_order
            ),
          })
        );

      setProducts(productsWithOrderedImages); 
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (e, product) => { 
    e.preventDefault();
    e.stopPropagation();
    
    const stockLimit = Number(product.stock ?? 0);
    if (stockLimit <= 0) {
      showNotification(`${product.name} is out of stock.`, "error");
      return;
    }
    
    const firstImage = product.product_images?.[0]?.image_url || "";
    const quantity = 1;

    try {
      const { data: { session }, error: userError } = await supabase.auth.getSession();
      if (userError) throw userError;
      const user = session?.user;

      // User is logged in, handle cart in Supabase
      if (user) {
        const { data: existingCartItem, error: fetchError } = await supabase
          .from("cart")
          .select("*")
          .eq("user_ID", user.id)
          .eq("product_ID", product.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        const userCurrentQty = existingCartItem ? existingCartItem.quantity : 0;
        if (userCurrentQty + quantity > stockLimit) {
          showNotification(`Cannot add more than ${stockLimit} of ${product.name} to cart.`, "error");
          return;
        }

        if (existingCartItem) {
          const { error: updateError } = await supabase
            .from("cart")
            .update({ quantity: existingCartItem.quantity + quantity })
            .eq("id", existingCartItem.id);

          if (updateError) throw updateError;
          showNotification(`Updated ${product.name} quantity in cart.`);
        } else {
          const { error: insertError } = await supabase
            .from("cart")
            .insert({
              user_ID: user.id,
              product_ID: product.id,
              quantity: quantity,
              email: user.email,
            });

          if (insertError) throw insertError;
          showNotification(`Added ${product.name} to cart.`);
        }
      } else {
        // Guest user, handle cart in localStorage with stock limits respected
        const existingCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        const existingItemIndex = existingCart.findIndex((item) => item.id === product.id);

        const guestCurrentQty = existingItemIndex > -1 ? existingCart[existingItemIndex].quantity : 0;
        
        if (guestCurrentQty + quantity > stockLimit) {
          showNotification(`Cannot add more than ${stockLimit} of ${product.name} to cart.`, "error");
          return;
        }

        if (existingItemIndex > -1) {
          existingCart[existingItemIndex].quantity += quantity;
        } else {
          existingCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            quantity: quantity,
            image: firstImage,
          });
        }
        localStorage.setItem("guestCart", JSON.stringify(existingCart));
        showNotification(`Added ${product.name} to cart.`);
      }
    } catch (err) {
      console.error("Cart error:", err);
      showNotification(err.message || "Error adding item to cart.", "error");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#C5AE98] relative">
      {notification.message && (
        <div
          role={notification.type === "error" ? "alert" : "status"}
          className={`fixed top-28 right-[22px] md:top-40 md:right-10 z-[100] max-w-[calc(100%-44px)] rounded-lg border border-white/30 px-4 py-3 font-sans text-sm md:text-base text-white shadow-lg ${
            notification.type === "error"
              ? "bg-gray-800/80"
              : "bg-[#8B6B4A]"
          }`}
        >
          {notification.message}
        </div>
      )}

      <ShopPageImage />
      <FilterBar />

       <div className="max-w-6xl mx-auto px-6 pt-8 md:pt-12 py-10">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-14">
          {products.map((product) => {
            const firstImage = product.product_images?.[0]?.image_url || "";

            return (
              <div
                key={product.id}
                className="flex flex-col items-center overflow-hidden rounded-md bg-white/15"
              >
                <Link
                  to={`/product/${product.id}`}
                  className="block w-full transition duration-200 hover:scale-102"
                >
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={product.name}
                      className="w-full aspect-[3/3] object-cover rounded-t-md"
                    />
                  ) : (
                    <div className="flex w-full aspect-[5/3] items-center justify-center rounded-t-md bg-gray-200">
                      No image available
                    </div>
                  )}

                  <div className="flex h-20 md:h-30 w-full flex-col items-center justify-start px-2 pt-3 md:pt-6 text-center font-serif text-white">
                    <h2 className="text-sm md:text-lg">
                      {product.name}
                    </h2>

                    <p className="text-sm md:text-lg">
                      ${Number(product.price).toFixed(2)}
                    </p>
                  </div>
                </Link>

                {/* Add to Cart inside the card */}
                <button
                  type="button"
                  onClick={(e) => handleAddToCart(e, product)}
                  className="mt-2 mb-4 w-[calc(100%-2rem)] max-w-60 h-8 md:h-10 rounded-md bg-white/15 border border-white/30 shadow-sm text-white font-sans text-base md:text-xl flex items-center justify-center gap-2 hover:scale-105 cursor-pointer transition"
                >
                  Add to Cart
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Shop;