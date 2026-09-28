import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

const CartElement = ({ onTotalChange }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  /* Fetch Cart (Handles both Anonymous Guests and Authenticated Users identically) */
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setErrorMessage("");

      // 1. Get current session
      let { data: { user }, error: userError } = await supabase.auth.getUser();

      // 2. If no user exists, quietly log them in anonymously to create a secure session
      if (userError || !user) {
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) {
          console.error("Error creating guest session:", anonError);
          setErrorMessage("Unable to initialize guest session.");
          setLoading(false);
          return;
        }
        user = anonData.user;
      }

      // 3. Query the database using the secure User ID (Works for both Guests & Real Users)
      const { data, error } = await supabase
        .from("cart")
        .select(`
          id,
          quantity,
          product_ID,
          product:products (
            id,
            name,
            price,
            stock,
            product_images (
              id,
              image_url
            )
          )
        `)
        .eq("user_ID", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching cart:", error);
        setErrorMessage("Unable to load cart.");
        setLoading(false);
        return;
      }

      setCartItems(data || []);
      setLoading(false);
    };

    fetchCart();
  }, []);

  /* Calculate Total */
  useEffect(() => {
    const calculatedTotal = cartItems.reduce((sum, item) => {
      if (!item.product) return sum;
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    onTotalChange(calculatedTotal);
  }, [cartItems, onTotalChange]);

  /* Handle Quantity Change */
  const handleQuantityChange = async (item, newQuantity) => {
    if (!item.product || newQuantity < 1 || newQuantity > item.product.stock) return;

    const { error } = await supabase
      .from("cart")
      .update({ quantity: newQuantity })
      .eq("id", item.id);

    if (error) {
      console.error("Error updating quantity:", error);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((cartItem) =>
        cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem
      )
    );
  };

  /* Handle Item Removal */
  const handleRemove = async (cartId) => {
    const { error } = await supabase.from("cart").delete().eq("id", cartId);

    if (error) {
      console.error("Error removing cart item:", error);
      return;
    }

    setCartItems((currentItems) => currentItems.filter((item) => item.id !== cartId));
  };

  if (loading) {
    return <p className="py-10 text-center text-gray-500">Loading cart...</p>;
  }

  if (errorMessage) {
    return <p className="py-10 text-center text-red-600">{errorMessage}</p>;
  }

  if (cartItems.length === 0) {
    return <p className="py-10 text-center text-gray-500">Your cart is empty.</p>;
  }

  return (
    <div>
      {cartItems.map((item) => {
        const product = item.product;
        if (!product) return null;

        const imageUrl = product.product_images?.[0]?.image_url;
        const itemTotal = Number(product.price) * item.quantity;

        return (
          <div
            key={item.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-x-8 items-center py-6 border-t border-gray-100"
          >
            <div className="flex flex-col items-start">
              <div className="w-16 h-16 overflow-hidden rounded-lg bg-gray-100">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex w-full h-full items-center justify-center text-xs text-gray-400">
                    No image
                  </div>
                )}
              </div>

              <p className="mt-3 font-semibold text-sm text-black">{product.name}</p>
              <div className="mt-2 h-0.5 w-36 bg-black" />

              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="mt-2 text-xs text-gray-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>

            <p className="text-center font-semibold text-black">
              ${Number(product.price).toFixed(2)}
            </p>

            <div className="flex items-center justify-center gap-5 text-black">
              <button
                type="button"
                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                −
              </button>

              <span className="w-5 text-center font-medium">{item.quantity}</span>

              <button
                type="button"
                onClick={() => handleQuantityChange(item, item.quantity + 1)}
                disabled={item.quantity >= product.stock}
                className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                +
              </button>
            </div>

            <p className="text-right font-semibold text-black">${itemTotal.toFixed(2)}</p>
          </div>
        );
      })}
    </div>
  );
};

export default CartElement;