import { useEffect, useState } from "react";
import MyCarousel from "../components/MyCarousel";
import HomeImage from "../components/HomePageImage";
import supabase from "../supabaseClient";

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (
            id,
            image_url
          )
        `)
<<<<<<< HEAD
        // INSERT POPULAR ITEMS TO DISPLAY HERE, INPUT NAME
        .order("name", ["Rose","Vanilla & Spearmint"]);
=======
        // INSERT POPULAR ITEMS TO DISPLAY HERE, INPUT ID
        .in("id", [4,5,6,7,8,9]);
>>>>>>> 1f82f01827b466b64949de2d1ca5c4599d8c60a9

      if (error) {
        console.error("Error fetching products:", error);
        return;
      }

      setProducts(data);
    };

    fetchProducts();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <HomeImage />
<<<<<<< HEAD

      <div className="w-full flex justify-center pt-6">
        <div className="grid grid-cols-2 gap-6">
          {products.map((product) => (
            <MyCarousel
              key={product.id}
              images={product.product_images?.map((img) => img.image_url) || []}
              description={product.name}
              buttonTo={`/product/${product.id}`}
            />
          ))}
        </div>
      </div>
    </div>
=======
    <div className="w-full flex justify-center pt-8">
      <h2 className="text-4xl md:text-5xl font-serif font-semibold text-white">Our Best Sellers</h2>
    </div>

      <div className="w-full flex justify-center pt-6">
        <div className="grid grid-cols-2 gap-6">
          {products.map((product) => (
            <MyCarousel
              key={product.id}
              images={product.product_images?.map((img) => img.image_url) || []}
              description={product.name}
              buttonTo={`/product/${product.id}`}
            />
          ))}
        </div>
      </div>
    </div>
>>>>>>> 1f82f01827b466b64949de2d1ca5c4599d8c60a9
  );
};

export default Home;