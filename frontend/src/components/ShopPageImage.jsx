import supabase from "../supabaseClient";

const getImageUrl = (imagePath) => {
  const { data } = supabase.storage
    .from("Product Images")
    .getPublicUrl(imagePath);

  return data.publicUrl;
};

function ShopPageImage() {
  const imageUrl = getImageUrl("images/home-page-image.png");

  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt="Shop page"
        className="w-full h-auto"
      />
      <div
        className="absolute inset-0 bg-black/20 lg:bg-transparent"
        aria-hidden="true"
      />
      {/* Text Over Image*/}
       <div className="absolute inset-0 flex flex-col items-center text-white text-center pt-23 md:pt-40">
            <h1 className="text-2xl md:text-5xl font-serif">
            Browse our Products
            </h1>
      </div>
    </div>
  );
}

export default ShopPageImage;