import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
              image_url,
              display_order
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
    return <p className="border-t border-white/70 py-10 text-center font-sans text-base text-gray-500">Your cart is empty.</p>;
  }

  return (
    <div>
      {cartItems.map((item) => {
        const product = item.product;
        if (!product) return null;

        const imageUrl = [...(product.product_images ?? [])]
          .sort((a, b) => a.display_order - b.display_order)[0]?.image_url;
        return (
          <div
            key={item.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-white/70 py-6"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex w-16 shrink-0 flex-col items-start">
                <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="mt-2 cursor-pointer font-sans text-sm text-white/70 hover:scale-[1.02] hover:text-white"
                >
                  Remove
                </button>
              </div>

              <div className="min-w-0">
                <Link
                  to={`/product/${product.id}`}
                  className="block break-words font-serif text-base text-white transition hover:opacity-70"
                >
                  {product.name}
                </Link>

                <div className="mt-2 flex items-center gap-2 text-white">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    aria-label={`Decrease quantity of ${product.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    −
                  </button>

                  <span className="w-5 text-center font-medium">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                    disabled={item.quantity >= product.stock}
                    aria-label={`Increase quantity of ${product.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="text-right text-white">
              <p className="text-sm text-white/70">Price</p>
              <p className= "mt-4">
                ${Number(product.price).toFixed(2)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CartElement;