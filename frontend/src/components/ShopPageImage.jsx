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
    <img
      src={imageUrl}
      alt="Shop page"
      className="w-full h-auto"
    />
  );
}

export default ShopPageImage;