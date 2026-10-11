import { useEffect, useState } from "react";
import SearchIcon from "./SearchIcon";
import supabase from "../supabaseClient";


function AdminSearch({onProductSelect}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

const searchProducts = async (searchTerm) => {
  const trimmedSearch = searchTerm.trim();

  if (!trimmedSearch) {
    setResults([]);
    return;
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, price, description, product_images(image_url, display_order)"
    )
    .or(
      `name.ilike.%${trimmedSearch}%,description.ilike.%${trimmedSearch}%`
    );

  if (error) {
    console.error("Search error:", error);
    setResults([]);
    return;
  }

  //Sort each product's images from Main to last
  const productsWithOrderedImages = (data || []).map((product) => ({
    ...product,
    product_images: [...(product.product_images || [])].sort(
      (firstImage, secondImage) =>
        firstImage.display_order - secondImage.display_order
    ),
  }));

  const lowercaseSearch = trimmedSearch.toLowerCase();

  const rankedResults = [...productsWithOrderedImages].sort(
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
    const searchDelay = setTimeout(() => {
      searchProducts(searchTerm);
    }, 300);

    return () => {
      clearTimeout(searchDelay);
    };
  }, [searchTerm]);


 return (
  <div className="relative w-50 md:w-60 h-8 md:h-10">
    <input
      type="text"
      value={searchTerm}
      onChange={(event) =>
        setSearchTerm(event.target.value)
      }
      className="w-full h-full rounded-full bg-white px-5 py-1 pr-10 text-left text-black text-sm md:text-xl placeholder:text-gray-400 outline-none"
      placeholder="Search"
    />

    <div className="absolute right-3 top-1/2 -translate-y-1/2">
      <SearchIcon />
    </div>

    {searchTerm.trim() && results.length > 0 && (
      <div className="absolute top-full right-0 z-50 mt-2 w-full rounded-lg bg-white shadow-lg overflow-hidden">
        {results.map((product) => {
          const firstImage =
            product.product_images?.[0]?.image_url || "";

          return (
            <button
                key={product.id}
                to={`/adminUpdateProduct/${product.id}`}
                onClick={() => {
                  onProductSelect?.(product.id);
                  setSearchTerm("");
                  setResults([]);
            }}
                className="flex w-full items-center gap-3 border-b border-gray-200 px-3 py-2 text-left text-black hover:bg-gray-100 last:border-b-0"
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
            </button>
          );
        })}
      </div>
    )}
  </div>
);
}

export default AdminSearch;