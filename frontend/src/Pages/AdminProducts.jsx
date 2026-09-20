import AdminHeader from "../components/AdminHeader";
import AdminNav from "../components/AdminNav";
import SearchAddProduct from "../components/AdminSearchAddProduct";
import supabase from "../supabaseClient";
import {useEffect, useState} from "react";  
import AdminProductTile from "../components/AdminProductTile"; 

function AdminProducts() {

  const [products, setProducts] = useState([]); //Products is current list, setProducts is function to update the list
  
  //Stores an error message if the products can't be fetched
  const [fetchError, setFetchError] = useState("");

  //Taken from Shop.jsx, this useEffect fetches the products from the database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setFetchError("");
        const { data, error } = await supabase
          .from("products")
          .select(
            "id, name, price, product_images(image_url, display_order), sales"
          );
      
        if (error){
          console.error("Error fetching products:", error);
          setFetchError("Could not load products. Please try again");
          return;
        }

        //Sort each product's iamges from Main to last
        const productsWithOrderedImages = (data || []).map(
          (product) => ({
            ...product,
            product_images: [...(product.product_images || [])].sort(
              (firstImage, secondImage) =>
                firstImage.display_order -
              secondImage.display_order
            ),
          })
        );

      setProducts(productsWithOrderedImages); 
    } catch (error) {
      console.error("Unexpected error while fetching products:", error);
      setFetchError("Could not load products. Please try again");
    }
  };

    fetchProducts();
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    const salesA = a.sales ?? 0;
    const salesB = b.sales ?? 0;
    if (salesB !== salesA) {
      return salesB - salesA; // Sort by sales in descending order
    }
    return (a.name || "").localeCompare(b.name || ""); // Sort by name in ascending order if sales are equal
  });


  return (
    <div className="min-h-screen pb-16"> {/* Container for the AdminProducts page */}
      
      <AdminHeader /> {/*Logo and profile button*/}
      
      <div className="flex flex-col justify-left mt-8 ml-8 md:ml-13 text-white mr-8 md:mr-13">

        <h1 className="text-3xl md:text-5xl font-serif">
          Your Products
        </h1>

        <SearchAddProduct /> {/* Search bar and add product button */}

        {fetchError && (
          <p className="mt-6 text-red-300">
            {fetchError}
          </p>
        )}

        {/* Product list section */}
        <div className= "flex flex-col justify-left gap-4 mt-6 mr-8 md:mr-15"></div>
          {sortedProducts.map((product) => ( //Map through the products array and render each product 
            
            <AdminProductTile
              key={product.id} //Unique key for each product
              product={product} //Pass the product object as a prop to the AdminProductTile component
            />

          ))}


      </div>


      <AdminNav /> {/*Navigation bar/footer*/}
      
    </div>
  );
}

export default AdminProducts;
