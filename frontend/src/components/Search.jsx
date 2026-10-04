import { Link, NavLink } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import SearchIcon from "./SearchIcon";
import supabase from "../supabaseClient";




function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const blurTimeoutRef = useRef(null);

 // Fetch top sellers when search term is empty
 const fetchTopSellingProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, description, product_images(image_url)")
    .order("sales", { ascending: false })
    .limit(4);

  if (error) {
    console.error("Error fetching popular products:", error);
    setResults([]);
    return;
  }

  setResults(data ?? []);
};


const searchProducts = async (searchTerm) => {
  const trimmedSearch = searchTerm.trim();

  if (!trimmedSearch) {
    //setResults([]);
    fetchTopSellingProducts();
    return;
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, price, description, product_images(image_url)"
    )
    .or(
      `name.ilike.%${trimmedSearch}%,description.ilike.%${trimmedSearch}%`
    );

  if (error) {
    console.error("Search error:", error);
    setResults([]);
    return;
  }

  const lowercaseSearch = trimmedSearch.toLowerCase();

  const rankedResults = [...(data ?? [])].sort(
    (firstProduct, secondProduct) => {
      const getNameScore = (product) => {
        const lowercaseName = product.name.toLowerCase();

        if (lowercaseName === lowercaseSearch) {
          return 3;
        }

        if (lowercaseName.startsWith(lowercaseSearch)) {
          return 2;
        }

        if (lowercaseName.includes(lowercaseSearch)) {
          return 1;
        }

        return 0;
      };

      return (
        getNameScore(secondProduct) -
        getNameScore(firstProduct)
      );
    }
  );

  setResults(rankedResults.slice(0, 4));

  console.log("Search results:", rankedResults.slice(0, 4));
};
useEffect(() => {

  if (!searchTerm.trim()) {
         if (isFocused) {
           fetchTopSellingProducts();
         }
         return;
      }

    const searchDelay = setTimeout(() => {
      searchProducts(searchTerm);
    }, 300);

    return () => {
      clearTimeout(searchDelay);
    };
     }, [searchTerm, isFocused]);

     const handleFocus = () => {
       if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
       setIsFocused(true);
       if (!searchTerm.trim()) {
         fetchTopSellingProducts();
       }
     };
    
     const handleBlur = () => {
       // 150ms buffer so clicking a product link registers before the menu closes
       blurTimeoutRef.current = setTimeout(() => {
         setIsFocused(false);
       }, 150);
     };


  return (
  <div className="relative w-40">
    <input
      type="text"
      value={searchTerm}
      onChange={(event) =>
        setSearchTerm(event.target.value)
      }
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="w-full rounded-full bg-white px-4 py-1 pr-10 outline-none"
      placeholder="Search"
    />

    <div className="absolute right-3 top-1/2 -translate-y-1/2">
      <SearchIcon />
    </div>

     {isFocused && results.length > 0 && (
      <div className="absolute top-full right-0 z-50 mt-2 w-72 rounded-lg bg-white shadow-lg overflow-hidden">
        {results.map((product) => {
         {!searchTerm.trim() && (
                 <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
                   Popular Items
                 </div>
               )}
         const firstImage =
            product.product_images?.[0]?.image_url || "";

          return (
            <Link
                key={product.id}
                to={`/product/${product.id}`}
                onClick={() => {
                setSearchTerm("");
                setResults([]);
            }}
                className="flex items-center gap-3 border-b border-gray-200 px-3 py-2 text-black hover:bg-gray-100 last:border-b-0"
            >
              {firstImage ? (
                <img
                  src={firstImage}
                  alt={product.name}
                  className="h-12 w-12 rounded object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200 text-xs text-gray-500">
                  No image
                </div>
              )}

              <p className="font-medium">
                {product.name}
              </p>
            </Link>
          );
        })}
      </div>
    )}
  </div>
);
}

export default Search;