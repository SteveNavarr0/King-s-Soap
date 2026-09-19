import { Link } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminNav from "../components/AdminNav";
import { useEffect, useState } from "react";
import AdminProductTile from "../components/AdminProductTile";
import supabase from "../supabaseClient";

function Admin() {
  const [products, setProducts] = useState([]);

  // Pull products from the database
  useEffect(() => {
    const fetchProducts = async () => {

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, product_images(image_url), sales");

      if (error) {
        console.error("Error fetching products:", error);
        return;
      }

      setProducts(data || []);
    };

    fetchProducts();
  }, []);


  // Sort products by sales, highest to lowest
  const sortedProducts = [...products].sort((a, b) => {

    const salesA = a.sales ?? 0;
    const salesB = b.sales ?? 0;

    if (salesB !== salesA) {
      return salesB - salesA;
    }

    // If sales are equal, sort alphabetically
    return (a.name || "").localeCompare(b.name || "");
  });


  // Only grab the first 3 products
  const topProducts = sortedProducts.slice(0, 3);


  return (
    <div className="min-h-screen"> {/* Container for the admin page */}
      
      <AdminHeader />
      
      <div className="flex flex-col justify-left mt-8 ml-8 mr-8 md:ml-13 md:mr-13 text-white">
        <h1 className="text-3xl md:text-5xl font-serif">
          Welcome, Anita
        </h1>

        <p className="text-base font-serif md:text-xl leading-relaxed">
          Here's your shop at a glance
        </p>
 {/* Top Sellers Section */}
 <div className="mt-4 md:mt-8 bg-white/10 rounded-xl p-4 md:p-6">

{/* Top Sellers Header */}
<div className="flex items-center justify-between mb-6">

  <h2 className="text-2xl md:text-3xl font-serif italic">
    Top Sellers
  </h2>

  <Link
    to="/AdminProducts"
    className="flex items-center gap-3 font-serif italic text-sm md:text-lg"
  >
    View All

    <span className="text-3xl">
      ›
    </span>
  </Link>

</div>


{/* Top 3 Products */}
{topProducts.map((product) => (

  <AdminProductTile
    key={product.id}
    product={product}
  />

))}

</div>

</div>
      
      <AdminNav />
      
    </div>
  );
}

export default Admin;