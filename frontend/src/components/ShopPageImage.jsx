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
        className="absolute inset-0 bg-black/20 md:bg-transparent"
        aria-hidden="true"
      />
      {/* Text Over Image*/}
      <div className="absolute inset-0 flex flex-col items-center pt-6 text-white text-center pt-18">
            <h1 className="text-4xl md:text-5xl font-serif font-semibold">
            Take a look at our products!
            </h1>
      </div>
    </div>
  );
}

export default ShopPageImage;