//return Carousel component with scrolling images, along with a button that links to a product page
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
    <Link
      to={buttonTo}
      className="flex flex-col items-center gap-3 cursor-pointer transition duration-200 hover:scale-102">
        <div className="relative w-[500px] h-[300px] overflow-hidden rounded-lg">
          {images.map((image, index) => ( 
          <img
                  key={index}
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    index === currentIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}  
          </div>
  
      <div className="w-[500px] h-[70px] flex items-center justify-center border border-white text-[#FFFFFF] text-lg font-[Inria_Serif] leading-none rounded">
        {buttonLabel}
      </div>
    </Link>
  );
}

export default CarouselHomePage;