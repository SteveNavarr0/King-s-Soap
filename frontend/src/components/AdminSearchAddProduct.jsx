import AdminSearch from "./AdminSearch";
import {Link} from "react-router-dom";

function SearchAddProduct() {
  return (
    <div>

      <div className="flex justify-between items-center pt-10">
       <Link to="/AdminCreateProduct" className=" w-40 md:w-60 h-8 md:h-10 rounded-full bg-white/15 backdrop-blur-lg border border-white/30 shadow-sm text-white text-sm md:text-2xl flex items-center justify-center hover:scale-105 cursor-pointer transition">
            Add a Product +
        </Link>
        <AdminSearch/>
      </div>
    </div>
  );
}

export default SearchAddProduct;