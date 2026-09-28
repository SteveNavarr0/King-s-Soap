import supabase from "../supabaseClient";
import { Link, NavLink } from "react-router-dom";
import { BsBag } from "react-icons/bs";
import Search from "./Search";

function FilterBar() {
  return (
    <div className="bg-[#C5AE98] py-4 px-10 border-b border-white/40">
      <div className="flex justify-between items-center">
        <div className="space-x-18 font-[Inter] text-md text-white">
          <NavLink 
            
                        to= "/Shop" 
                        className={({ isActive }) => 
                        `inline-block transition duration-200 hover:scale-105 ${
                        isActive ? "text-[#8B6B4A]" : ""}`
                        }    
                    > All Products
                    </NavLink>
          <NavLink 
            
                        to= "/coconutOilShop" 
                        className={({ isActive }) => 
                        `inline-block transition duration-200 hover:scale-105 ${
                        isActive ? "text-[#8B6B4A]" : ""}`
                        }    
                    > Coconut Oil Soaps
                    </NavLink>

          <NavLink 
            
                        to= "/organicShop" 
                        className={({ isActive }) => 
                        `inline-block transition duration-200 hover:scale-105 ${
                        isActive ? "text-[#8B6B4A]" : ""}`
                        }    
                    > Organic Soaps
                    </NavLink>
          <NavLink 
            
                        to= "/allNaturalShop" 
                        className={({ isActive }) => 
                        `inline-block transition duration-200 hover:scale-105 ${
                        isActive ? "text-[#8B6B4A]" : ""}`
                        }    
                    > All Natural Soaps
                    </NavLink>
          <NavLink 
            
                        to= "/lipBalmShop" 
                        className={({ isActive }) => 
                        `inline-block transition duration-200 hover:scale-105 ${
                        isActive ? "text-[#8B6B4A]" : ""}`
                        }    
                    > Lip Balms
                    </NavLink>
           <NavLink 
            
                        to= "/soapDishShop" 
                        className={({ isActive }) => 
                        `inline-block transition duration-200 hover:scale-105 ${
                        isActive ? "text-[#8B6B4A]" : ""}`
                        }    
                    > Soap Dishes
                    </NavLink>
        </div>
      <div className="ml-auto">
        <Search />
      </div>
    </div>
  </div>
  );
}

export default FilterBar;