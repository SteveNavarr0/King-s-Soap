//return Carousel component with scrolling images, along with a button that links to a product page
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function CarouselHomePage({ images , buttonLabel, price, buttonTo, }) {
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
      className="flex w-full max-w-[500px] min-w-0 flex-col items-center cursor-pointer transition duration-200 hover:scale-102">
        <div className="relative w-full aspect-[5/3] overflow-hidden rounded-t-md md:h-[300px] md:aspect-auto">
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
  
      <div className="flex h-20 w-full items-center justify-center rounded-b-md border border-white/30 bg-white/15 px-2 py-6 md:py-15 text-center font-serif text-sm leading-snug text-white md:h-[70px] md:text-lg">
        <div className="flex flex-col items-center">
          <span>{buttonLabel}</span>
          <span>${Number(price).toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}

export default CarouselHomePage;