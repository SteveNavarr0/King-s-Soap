import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../supabaseClient";
import ShopPageImage from "../components/ShopPageImage";
import FilterBar from "../components/FilterBar";

const LipBalmShop = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, product_images(image_url)")
        .ilike("category", "%Lip Balm%");

      setProducts(data);
    };

    fetchProducts();
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#C5AE98]">
      <ShopPageImage />
      <FilterBar />

      <div className="max-w-6xl mx-auto px-6 pt-14 py-10">
        <div className="grid grid-cols-3 gap-x-10 gap-y-14">
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LipBalmShop;