import SearchIcon from "./SearchIcon";
import {Link} from "react-router-dom";

function SearchAddProduct() {
  return (
    <div>

      <div className="flex justify-between items-center pt-10">
        
        <div className="relative w-40 md:w-60 h-8 md:h-10">
            <input
                type="text"
                className="w-full h-full rounded-full bg-white px-5 md:px-5 py-1 md:py-2 pr-10 md:pr-10 outline-none"
                placeholder=""
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <SearchIcon />
            </div>
       
        </div>


        <Link to="/AdminCreateProduct" className=" w-40 md:w-60 h-8 md:h-10 rounded-full bg-white/15 backdrop-blur-lg border border-white/30 shadow-sm text-white text-sm md:text-2xl flex items-center justify-center hover:scale-105 cursor-pointer transition">
            Add a Product +
        </Link>

      </div>
    </div>
  );
}

export default SearchAddProduct;