import { useEffect, useState } from "react";
import CarouselHomePage from "../components/CarouselHomePage";
import HomeImage from "../components/HomePageImage";
import supabase from "../supabaseClient";

const Home = () => {
  //products var holds the data fetched from the products table in supabase
  //setProducts is a function that updates the products var
  const [products, setProducts] = useState([]);

  useEffect(() => {
   //pull data from spefic columns from produccts table in supabase
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
        // INSERT POPULAR ITEMS TO DISPLAY HERE, INPUT ID from supabase products table
        //this is hardcoded right now, but we should make it this dymamic with a tag system 
        .in("id", [4,5,6,7,8,9]);

      //error handling for fetch request 
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
      {/* Display the home page image */}
      <HomeImage />
      {/* Section title for best sellers */}
      <div className="w-full flex justify-center pt-8">
        <h2 className="text-4xl md:text-5xl font-serif font-semibold text-white">Our Best Sellers</h2>
      </div>
      {/* Product grid that displays the products fetched from supabase in a carousel format */}
      <div className="w-full flex justify-center pt-6">
        <div className="grid grid-cols-2 gap-6">
          {products.map((product) => (
            <CarouselHomePage
              key={product.id}
              images={product.product_images?.map((img) => img.image_url) || []}
              buttonLabel={product.name}
              buttonTo={`/product/${product.id}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;