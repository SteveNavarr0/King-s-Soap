import supabase from "../supabaseClient";
import { Link, NavLink } from "react-router-dom";
import { BsBag } from "react-icons/bs";
import SearchIcon from "../components/SearchIcon";

function FilterBar() {
  return (
    <div className="bg-[#C5AE98] p-4">
      <div className="flex justify-between items-center">
        <div className="space-x-6 font-[Inter] text-sm text-black">
          <button className="hover:opacity-70">All Soaps</button>
          <button className="hover:opacity-70">Coconut Oil Soaps</button>
          <button className="hover:opacity-70">Organic Soaps</button>
          <button className="hover:opacity-70">All Natural Soaps</button>
          <button className="hover:opacity-70">Soap Dishes</button>
          <button className="hover:opacity-70">Lip Balms</button>
        </div>

        <div className="relative w-40">
          <input
            type="text"
            className="w-full rounded-full bg-white px-4 py-1 pr-10 outline-none"
            placeholder=""
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <SearchIcon />
            </div>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;