//return Carousel component with scrolling images, along with a button that links to a product page
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function CarouselHomePage({
  images,
  buttonLabel,
  price,
  buttonTo,
  product,
  onAddToCart,
}) {
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
    <div className="flex w-full max-w-[500px] min-w-0 flex-col items-center overflow-hidden rounded-md bg-white/15">
      <Link
        to={buttonTo}
        className="block w-full cursor-pointer transition duration-200 hover:scale-102"
      >
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

        <div className="flex h-20 md:h-30 w-full flex-col items-center justify-start px-2 pt-3 md:pt-6 text-center font-serif text-white">
          <h2 className="text-sm md:text-lg">
            {buttonLabel}
          </h2>

          <p className="text-sm md:text-lg">
            ${Number(price).toFixed(2)}
          </p>
        </div>
      </Link>

      <button
        type="button"
        onClick={(e) => onAddToCart(e, product)}
        className="mb-4 w-[calc(100%-2rem)] max-w-60 h-8 md:h-10 rounded-md bg-white/15 border border-white/30 shadow-sm text-white font-sans text-base md:text-xl flex items-center justify-center gap-2 hover:scale-105 cursor-pointer transition"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default CarouselHomePage;