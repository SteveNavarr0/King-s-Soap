//return Carousel component with scrolling images, along with a button that links to a product page
import { useState, useEffect } from "react";
import RouteButton from "./RouteButton";

function CarouselHomePage({ images , buttonLabel, buttonTo, }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  
  useEffect(() => {
    //check for images, if no images return
    if (!images || images.length === 0) return;
    //rate that carousel "changes" images, currently set to: 7 seconds (7000 milliseconds)
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        //if at last image, go back to first image, else go to next image
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000);

    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full">
    <div className="relative w-[500px] h-[300px] overflow-hidden rounded-lg">
      {images.map((image, index) => ( 
      <img
              key={index}
              src={image}
              alt={`Slide ${index + 1}`}
              className={`absolute top-0 left-0 w-full h-full object-cover rounded-lg transition-opacity duration-1000 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}  
    </div>
    </div>
    <div className="border border-white text-[#FFFFFF] font-[Inria_Serif] px-2 py-2 rounded">
      <RouteButton to={buttonTo} label={buttonLabel} />
    </div>
    </div>
  );
}

export default CarouselHomePage;