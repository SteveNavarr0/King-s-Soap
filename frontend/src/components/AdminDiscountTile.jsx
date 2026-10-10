const AdminDiscountTile = ({ discount, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick} // Open this discount in the update popup.
            className={`mb-4 w-full min-h-18 md:min-h-25 p-4 rounded-lg md:border shadow-sm text-white flex items-center justify-between text-left hover:scale-[1.02] transition duration-200 cursor-pointer ${
                discount.is_active
                    ? "bg-white/15 md:border-white/30"
                    : "bg-black/25 md:border-white/10 opacity-75"
            }`}      
        >
            {/* Use the product image dimensions for a discount symbol. */}
            <span className="w-16 h-14 md:w-20 md:h-20 bg-gray-200/20 rounded-sm mr-4 flex shrink-0 items-center justify-center text-xl md:text-2xl">
                {discount.type === "percentage" ? "%" : "$"}
            </span>

            {/* Position the code like the product name. */}
            <span className="text-base md:text-2xl font-serif font-medium truncate flex-1 mr-4">
                {discount.code}
            </span>

            {/* Keep the value and status together where product sales appear. */}
            <span className="text-base md:text-2xl whitespace-nowrap">
                {discount.type === "percentage"
                    ? `${discount.value}%`
                    : `$${discount.value}`}{" "}
                · {discount.is_active ? "Active" : "Inactive"}
            </span>
        </button>
    );
};

export default AdminDiscountTile;