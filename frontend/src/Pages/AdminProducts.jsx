import AdminHeader from "../components/AdminHeader";
import AdminNav from "../components/AdminNav";
import SearchAddProduct from "../components/AdminSearchAddProduct";
import supabase from "../supabaseClient";
import {useEffect, useState} from "react";  
import AdminProductTile from "../components/AdminProductTile"; 
import AdminUpdateProduct from "../Pages/AdminUpdateProduct";
import AdminCreateProduct from "../Pages/AdminCreateProduct";
import { useNavigate } from "react-router-dom";

function AdminProducts() {

  const navigate = useNavigate();

  const [products, setProducts] = useState([]); //Products is current list, setProducts is function to update the list
  
  //Stores an error message if the products can't be fetched
  const [fetchError, setFetchError] = useState("");

  //Stores ID of product open in popup
  const [selectedProductId, setSelectedProductId] = useState(null);

  //Is add product popup open
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  //Taken from Shop.jsx, this useEffect fetches the products from the database
    const fetchProducts = async () => {
      try {
        setFetchError("");
        const { data, error } = await supabase
          .from("products")
          .select(
            "id, name, price, product_images(image_url, display_order), sales, is_active")
          .eq("is_active", true);//Only fetch products that are currently active;
      
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

  //Fetches products
  useEffect(() => {
    fetchProducts();
  }, []);

  //sorting products by sales, highest to lowest, and then alphabetically if sales are equal
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

        <p className="text-base font-serif md:text-xl leading-relaxed">
          Add, update, and manage your products
        </p>

         <div className="text-black">
          <SearchAddProduct // Search bar and add product button 
            onAddProductClick={() => setIsAddProductOpen(true)}
            onArchiveClick={() => navigate("/adminArchive")}
            onProductSelect={(productId) => setSelectedProductId(productId)}
          />
        </div>

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
              onClick={() => setSelectedProductId(product.id)} //Stores ID when tile is clicked
            />

          ))}


      </div>

      {/*Open add product popup */}
      {isAddProductOpen && (
        <AdminCreateProduct
          productId={selectedProductId}
          onClose={() => setIsAddProductOpen(false)}
          onProductCreated={fetchProducts}
        />
      )}



      {/*Open selected product update popup */}
      {selectedProductId && (
        <AdminUpdateProduct
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
          onProductChanged={fetchProducts}
        />
      )}

      {!selectedProductId && !isAddProductOpen && <AdminNav />}      
    </div>
  );
}

export default AdminProducts;
