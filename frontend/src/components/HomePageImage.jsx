import supabase from "../supabaseClient";
//pull image from supabase, PUBLIC, change ot PRIVATE when production
const getImageUrl =  (imagePath) => {
    const { data } = supabase.storage
      .from("Product Images")
      .getPublicUrl(imagePath);
      return data.publicUrl;
  };

function HomeImage() {
        const HomePageImage = getImageUrl("images/home-page-image.png");
    return (
        <div className = "relative flex justify-between items-center home-image">
            
        {/*Home Page Image*/}
            <img src={HomePageImage} alt="HomePageImage" className="home-page-image mx-auto w-full" />        
        {/*Text Over the Image*/} 
        <div className="absolute inset-0 flex flex-col items-center pt-6 text-white text-center pt-18">
            <h1 className="text-4xl md:text-5xl font-serif font-semibold">
            King’s Soap
            </h1>

            <p className="mt-4 text-base md:text-xl font-medium leading-relaxed">
            Enjoying the art of soap-making since 2016.
            </p>
            <p className="text-xl md:text-xl font-semibold">Hand-Made</p>
            <p className="text-xl md:text-xl font-semibold">Family-Owned</p>
        </div>
        {/*
        <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-4xl font-bold p-4  bg-opacity-50">
                Kings Soap
            </p>
            <p className="text-white text-4xl  p-4  bg-opacity-50">
                Kings Soap
            </p>
            
        </div>
        */}
        </div>
    
    );
}

export default HomeImage;