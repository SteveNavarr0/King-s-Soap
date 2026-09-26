import supabase from "../supabaseClient";
import { Link, NavLink } from "react-router-dom";
import { BsBag } from "react-icons/bs";
import Search from "./Search";

function FilterBar() {
  return (
    <div className="bg-[#C5AE98] p-4">
      <div className="flex justify-between items-center">
        <div className="space-x-6 font-[Inter] text-sm text-black">
          <NavLink 
            
                        to= "/Shop" 
                        className={({ isActive }) => 
                        `inline-block transition duration-200 hover:scale-105 ${
                        isActive ? "text-[#8B6B4A]" : "text-black hover:opacity-70"}`
                        }    
                    > All Products
                    </NavLink>
          <NavLink 
            
                        to= "/coconutOilShop" 
                        className={({ isActive }) => 
                        `inline-block transition duration-200 hover:scale-105 ${
                        isActive ? "text-[#8B6B4A]" : "text-black hover:opacity-70"}`
                        }    
                    > Coconut Oil Soaps
                    </NavLink>

          <NavLink 
            
                        to= "/organicShop" 
                        className={({ isActive }) => 
                        `inline-block transition duration-200 hover:scale-105 ${
                        isActive ? "text-[#8B6B4A]" : "text-black hover:opacity-70"}`
                        }    
                    > Organic Soaps
                    </NavLink>
          <NavLink 
            
                        to= "/allNaturalShop" 
                        className={({ isActive }) => 
                        `inline-block transition duration-200 hover:scale-105 ${
                        isActive ? "text-[#8B6B4A]" : "text-black hover:opacity-70"}`
                        }    
                    > All Natural Soaps
                    </NavLink>
          <NavLink 
            
                        to= "/lipBalmShop" 
                        className={({ isActive }) => 
                        `inline-block transition duration-200 hover:scale-105 ${
                        isActive ? "text-[#8B6B4A]" : "text-black hover:opacity-70"}`
                        }    
                    > Lip Balms
                    </NavLink>
           <NavLink 
            
                        to= "/soapDishShop" 
                        className={({ isActive }) => 
                        `inline-block transition duration-200 hover:scale-105 ${
                        isActive ? "text-[#8B6B4A]" : "text-black hover:opacity-70"}`
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