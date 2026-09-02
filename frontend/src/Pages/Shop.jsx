import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../supabaseClient";
import ShopPageImage from "../components/ShopPageImage";
import FilterBar from "../components/FilterBar";

const Shop = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, product_images(image_url)");

      setProducts(data);
    };

    fetchProducts();
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#C5AE98]">
      <ShopPageImage />
      <FilterBar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-3 gap-x-10 gap-y-14">
          {products.map((product) => {
            const firstImage = product.product_images?.[0]?.image_url || "";

            return (
              <Link
                to={`/product/${product.id}`}
                key={product.id}
                className="block"
              >
                <div className="rounded-lg overflow-hidden">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={product.name}
                      className="w-full h-72 object-cover"
                    />
                  ) : (
                    <div className="w-full h-72 bg-gray-200 flex items-center justify-center">
                      No image available
                    </div>
                  )}

                  <div className="pt-3 text-center">
                    <h2 className="text-lg font-medium">{product.name}</h2>
                    <p className="text-base">${Number(product.price).toFixed(2)}</p>
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

export default Shop;