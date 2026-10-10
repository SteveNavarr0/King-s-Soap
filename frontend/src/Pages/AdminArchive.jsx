import AdminHeader from "../components/AdminHeader";
import AdminNav from "../components/AdminNav";
import AdminSearchArchive from "../components/AdminSearchArchive";
import supabase from "../supabaseClient";
import {useEffect, useState} from "react";  
import AdminProductTile from "../components/AdminProductTile"; 
import AdminUpdateProduct from "../Pages/AdminUpdateProduct";

function AdminArchive() {

  const [products, setProducts] = useState([]); //Products is current list, setProducts is function to update the list
  
  //Stores an error message if the products can't be fetched
  const [fetchError, setFetchError] = useState("");

  const [selectedProductId, setSelectedProductId] = useState(null);

  //Taken from Shop.jsx, this useEffect fetches the products from the database
 const fetchProducts = async () => {
  try {
    setFetchError("");

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, price, product_images(image_url, display_order), sales, is_active"
      )
      .eq("is_active", false);

    if (error) {
      console.error("Error fetching products:", error);
      setFetchError("Could not load products. Please try again");
      return;
    }

    const productsWithOrderedImages = (data || []).map(
      (product) => ({
        ...product,
        product_images: [...(product.product_images || [])].sort(
          (firstImage, secondImage) =>
            firstImage.display_order - secondImage.display_order
        ),
      })
    );

    setProducts(productsWithOrderedImages);

  } catch (error) {
    console.error("Unexpected error while fetching products:", error);
    setFetchError("Could not load products. Please try again");
  }
};

// Fetch archived products when the page loads
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
          Your Archived Products
        </h1>
         <div className="text-black">
          <AdminSearchArchive onProductSelect={(productId) => setSelectedProductId(productId)} />
        </div>

        {fetchError && (
          <p className="mt-6 text-red-300">
            {fetchError}
          </p>
        )}
        {/* Product list section */}
        <div className="flex flex-col justify-left gap-4 mt-6 mr-8 md:mr-15">
          {sortedProducts.map((product) => (
            <AdminProductTile
              key={product.id}
              product={product}
              onClick={() => setSelectedProductId(product.id)}
            />
          ))}
        </div>


      </div>


      {/* Open selected archived product update popup */}
      {selectedProductId !== null && (
        <AdminUpdateProduct
          productId={selectedProductId}
          isArchived={true}
          onClose={() => setSelectedProductId(null)}
          onProductChanged={fetchProducts}
        />
      )}

      {/* Only show navigation when popup is closed */}
      {selectedProductId === null && <AdminNav />}
      
    </div>
  );
}

export default AdminArchive;
