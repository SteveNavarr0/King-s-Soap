import AdminHeader from "../components/AdminHeader";
import AdminNav from "../components/AdminNav";
import SearchAddProduct from "../components/AdminSearchAddProduct";
import supabase from "../supabaseClient";
import {useEffect, useState} from "react";  
import AdminProductTile from "../components/AdminProductTile"; 

function AdminProducts() {

  const [products, setProducts] = useState([]); //Products is current list, setProducts is function to update the list

  //Taken from Shop.jsx, this useEffect fetches the products from the database
  useEffect(() => {
    const fetchProducts = async () => {

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, product_images(image_url)");

      setProducts(data); //Function to store returned data to products variable
    };

    fetchProducts();
  }, []);


  return (
    <div className="min-h-screen pb-16"> {/* Container for the AdminProducts page */}
      
      <AdminHeader /> {/*Logo and profile button*/}
      
      <div className="flex flex-col justify-left mt-8 ml-8 md:ml-13 text-white mr-8 md:mr-13">

        <h1 className="text-3xl md:text-5xl font-serif">
          Your Products
        </h1>

        <SearchAddProduct /> {/* Search bar and add product button */}


        {/* Product list section */}
        <div className= "flex flex-col justify-left gap-4 mt-6 mr-8 md:mr-15"></div>
          {products.map((product) => ( //Map through the products array and render each product 
            
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
