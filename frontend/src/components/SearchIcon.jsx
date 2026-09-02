import supabase from "../supabaseClient";

const getImageUrl = (imagePath) => {
  const { data } = supabase.storage
    .from("Product Images")
    .getPublicUrl(imagePath);

  return data.publicUrl;
};

function SearchIcon() {
  const imageUrl = getImageUrl("images/Search Icon.png");

  return (
    <img
      src={imageUrl}
      alt="Search Icon"
      className="w-5 h-5 object-contain"
    />
  );
}

export default SearchIcon;