import { useEffect, useState } from "react";
import CarouselHomePage from "../components/CarouselHomePage";
import HomeImage from "../components/HomePageImage";
import supabase from "../supabaseClient";

const Home = () => {
  //products var holds the data fetched from the products table in supabase
  //setProducts is a function that updates the products var
  const [products, setProducts] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  useEffect(() => {
    if (!notification) return;

    const timeout = setTimeout(() => {
      setNotification(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [notification]);

  useEffect(() => {
   //pull data from spefic columns from produccts table in supabase
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (
            id,
            image_url,
            display_order
          )
        `)
        //pull top sellers from products table in supabase
        .order("sales", { ascending: false })
        // Get top 6 products
       .limit(6); 

      //error handling for fetch request 
      if (error) {
        console.error("Error fetching products:", error);
        return;
      }
      
      setProducts(data);
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

    const firstImage = [...(product.product_images ?? [])]
      .sort((a, b) => a.display_order - b.display_order)[0]?.image_url || "";

    const quantity = 1;

    try {
      const {
        data: { session },
        error: userError,
      } = await supabase.auth.getSession();

      if (userError) throw userError;

      const user = session?.user;

      if (user) {
        const { data: existingCartItem, error: fetchError } = await supabase
          .from("cart")
          .select("*")
          .eq("user_ID", user.id)
          .eq("product_ID", product.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        const currentQuantity = Number(existingCartItem?.quantity ?? 0);

        if (currentQuantity + quantity > stockLimit) {
          showNotification(
            `Cannot add more than ${stockLimit} of ${product.name} to cart.`,
            "error"
          );
          return;
        }

        if (existingCartItem) {
          const { error: updateError } = await supabase
            .from("cart")
            .update({ quantity: currentQuantity + quantity })
            .eq("id", existingCartItem.id);

          if (updateError) throw updateError;

          showNotification(`Updated ${product.name} quantity in cart.`);
        } else {
          const { error: insertError } = await supabase
            .from("cart")
            .insert({
              user_ID: user.id,
              product_ID: product.id,
              quantity,
              email: user.email,
            });

          if (insertError) throw insertError;

          showNotification(`Added ${product.name} to cart.`);
        }
      } else {
        const existingCart = JSON.parse(
          localStorage.getItem("guestCart") || "[]"
        );

        const existingItemIndex = existingCart.findIndex(
          (item) => item.id === product.id
        );

        const currentQuantity = existingItemIndex > -1
          ? Number(existingCart[existingItemIndex].quantity)
          : 0;

        if (currentQuantity + quantity > stockLimit) {
          showNotification(
            `Cannot add more than ${stockLimit} of ${product.name} to cart.`,
            "error"
          );
          return;
        }

        if (existingItemIndex > -1) {
          existingCart[existingItemIndex].quantity = currentQuantity + quantity;
        } else {
          existingCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            quantity,
            image: firstImage,
          });
        }

        localStorage.setItem("guestCart", JSON.stringify(existingCart));
        showNotification(`Added ${product.name} to cart.`);
      }
    } catch (err) {
      console.error("Cart error:", err);
      showNotification(
        err.message || "Error adding item to cart.",
        "error"
      );
    }
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {notification && (
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

      {/* Display the home page image */}
      <HomeImage />
      {/* Section title for best sellers */}
      <div className="w-full flex justify-center pt-8">
        <h2 className="text-2xl md:text-4xl font-serif text-white">Our Best Sellers</h2>
      </div>
      {/* Product grid that displays the products fetched from supabase in a carousel format */}
      <div className="w-full flex justify-center px-4 pt-6">
        <div className="grid w-full max-w-[1024px] grid-cols-2 justify-items-center gap-4 md:gap-6">
          {products.map((product) => (
             <CarouselHomePage
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              images={[...(product.product_images ?? [])]
                .sort((a, b) => a.display_order - b.display_order)
                .map((img) => img.image_url)}
              buttonLabel={product.name}
              price={product.price}
              buttonTo={`/product/${product.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;