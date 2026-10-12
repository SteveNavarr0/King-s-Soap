function AddNewDiscount({ onAddDiscountClick }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 mt-4 md:mt-8">
        <button
          type="button"
          onClick={onAddDiscountClick}
          className="w-40 md:w-60 h-8 md:h-10 rounded-full bg-white/15 border border-white/30 shadow-sm text-white text-sm md:text-2xl flex items-center justify-center hover:scale-105 cursor-pointer transition"
        >
          Add a Discount +
        </button>
      </div>
    </div>
  );
}

export default AddNewDiscount;