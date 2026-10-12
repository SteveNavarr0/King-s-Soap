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
        .select("id, name, price, stock, product_images(image_url, display_order)")
        .eq("is_active", true);//Only fetch products that are currently active

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
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 ${
            notification.type === "error" ? "bg-red-600" : "bg-black"
          }`}
        >
          {notification.message}
        </div>
      )}

      <ShopPageImage />
      <FilterBar />

      <div className="max-w-6xl mx-auto px-6 pt-14 py-10">
        <div className="grid grid-cols-3 gap-x-10 gap-y-14">
          {products.map((product) => {
            const firstImage = product.product_images?.[0]?.image_url || "";

            /* Added a flex container to center the product card and button*/
            return (
              <div key={product.id} className="flex flex-col items-center"> 
               <Link
                to={`/product/${product.id}`}
                key={product.id}
                className="block transition duration-200 hover:scale-102"
              >
                <div>
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={product.name}
                      className="w-full h-72 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-full h-72 bg-gray-200 flex items-center justify-center rounded-lg mb-3">
                      No image available
                    </div>
                  )}

                  <div className="text-center border border-white text-[#FFFFFF] font-[Inria_Serif] px-2 py-2 rounded">
                    <h2 className="text-base">{product.name}</h2>
                    <p className="text-base">${Number(product.price).toFixed(2)}</p>
                  </div>
                </div>
              </Link>
              {/* Add to Cart button below the product card */}
              <button 
              onClick={(e) => handleAddToCart(e,product)} //button for the add to cart function
              className="mt-3 flex items-center justify-center gap-2 bg-[#E2DCD5] text-black text-sm font-medium px-4 py-1.5 rounded-full shadow-sm hover:bg-white transition-colors duration-200"
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