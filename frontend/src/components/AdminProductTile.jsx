
const AdminProductTile = ({ product, onClick }) => {
  return (
   <button
      type="button"

      //Runs selection function for popup
      onClick={onClick}
      className="mb-4 w-full min-h-18 md:min-h-25 p-4 rounded-lg bg-white/15 md:border md:border-white/30 shadow-sm text-white flex items-center justify-between text-left cursor-pointer"
    >
        
        {/* Product Image / Placeholder */}
        {product.product_images && product.product_images.length > 0 ? (
          <img
            src={product.product_images[0].image_url}
            alt={product.name}
            className="w-16 h-14 md:w-20 md:h-20 object-cover rounded-sm mr-4"
          />
        ) : (
          <div className="w-16 h-14 md:w-20 md:h-20 bg-gray-200/20 rounded-sm mr-4 flex items-center justify-center text-gray-300 text-xs text-center px-1">
            No Image
          </div>
        )}

        {/* Product Name */}
        <span className="text-base md:text-2xl font-serif font-medium truncate flex-1 mr-4">
          {product.name}
        </span>

        {/* Sales Stats */}
        <span className="text-base md:text-2xl whitespace-nowrap">
          Sales: {product.sales ?? 0}
        </span>
      </button>
  );
};

export default AdminProductTile;