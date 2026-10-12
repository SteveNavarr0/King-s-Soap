import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../supabaseClient";
import ShopPageImage from "../components/ShopPageImage";
import FilterBar from "../components/FilterBar";

const SoapDishShop = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, product_images(image_url, display_order)")
        .ilike("category", "%Soap Dish%");

      if (error) {
        console.error("Error fetching products:", error);
        return;
      }

      // Sort each product's images from main to last
      const productsWithOrderedImages = (data || []).map((product) => ({
        ...product,
        product_images: [...(product.product_images || [])].sort(
          (firstImage, secondImage) =>
            firstImage.display_order - secondImage.display_order
        ),
      }));

      setProducts(productsWithOrderedImages);
    };

    fetchProducts();
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#C5AE98]">
      <ShopPageImage />
      <FilterBar />

      <div className="max-w-6xl mx-auto px-6 pt-14 py-10">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-14">
          {products.map((product) => {
            const firstImage = product.product_images?.[0]?.image_url || "";

            return (
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
                      className="w-full aspect-[5/3] object-cover rounded-t-md"
                    />
                  ) : (
                    <div className="flex w-full aspect-[5/3] items-center justify-center rounded-t-md bg-gray-200">
                      No image available
                    </div>
                  )}

                  <div className="flex h-20 w-full flex-col items-center justify-center rounded-b-md bg-white/15 px-2 py-6 md:py-15 text-center font-serif text-white md:h-[70px]">
                    <h2 className="text-sm md:text-lg">{product.name}</h2>
                    <p className="text-sm md:text-lg">
                      ${Number(product.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SoapDishShop;