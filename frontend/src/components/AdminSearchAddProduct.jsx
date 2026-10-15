import AdminSearch from "./AdminSearch";

function SearchAddProduct({onAddProductClick, onArchiveClick, onProductSelect}) {
  return (
    <div>
      {/* Stack the search above the buttons below the large-screen breakpoint */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 md:mt-8">        
        <button
          type="button"
          // Open the add product popup.
          onClick={onAddProductClick}
          className="w-[calc(50%-0.5rem)] lg:w-60 h-8 md:h-10 rounded-full bg-white/15 border border-white/30 shadow-sm text-white text-sm md:text-2xl flex items-center justify-center gap-2 hover:scale-105 cursor-pointer transition"
          >
          Add<span className="hidden md:inline">a Product +</span>
        </button>
        
        
        
        <button
          type="button"
          onClick={onArchiveClick}
          className="w-[calc(50%-0.5rem)] lg:w-60 h-8 md:h-10 rounded-full bg-white/15 border border-white/30 shadow-sm text-white text-sm md:text-2xl flex items-center justify-center hover:scale-105 cursor-pointer transition"
        >
          Archive
        </button>
        
        <div className="order-first w-full lg:order-none lg:w-auto">

          <AdminSearch 
            onProductSelect={onProductSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default SearchAddProduct;