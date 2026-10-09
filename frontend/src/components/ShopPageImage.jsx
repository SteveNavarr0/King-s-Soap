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
    </div>
  );
}

export default ShopPageImage;