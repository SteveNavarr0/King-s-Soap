import supabase from "../supabaseClient";
import { Link, NavLink } from "react-router-dom";
import { BsBag } from "react-icons/bs";
import Search from "./Search";

function FilterBar() {
  return (
    <div className="bg-[#C5AE98] px-6 py-4 border-b border-white/40 md:px-10">
      <div className="flex flex-col-reverse items-stretch gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
        <div className="flex min-w-0 flex-1 gap-6 overflow-x-auto overflow-y-hidden whitespace-nowrap font-sans text-base text-white xl:gap-18 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

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
      <div className="w-full lg:ml-auto lg:w-auto">
        <Search />
      </div>
    </div>
  </div>
  );
}

export default FilterBar;