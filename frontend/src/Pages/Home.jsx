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
        // INSERT POPULAR ITEMS TO DISPLAY HERE, INPUT NAME
        .order("name", ["Rose","Vanilla & Spearmint"]);

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
  );
};

export default Home;