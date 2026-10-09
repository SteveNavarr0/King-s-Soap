import {FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaInstagram} from "react-icons/fa";
import ContactForm from "../components/ContactForm";
import {useState} from "react";
import {useLocation} from "react-router-dom";

function Footer() {
  const[isContactFormOpen, setIsContactFormOpen] = useState(false);
  const { pathname } = useLocation();
  const hasPhotoBackground = [
    "/login",
    "/userchangepassword",
    "/emailtopwreset",
    "/createaccount",
    "/verifyaccount",
  ].includes(pathname.toLowerCase());

  return (
    <footer className={`${hasPhotoBackground ? "absolute bottom-0 left-0 w-full bg-transparent" : "bg-[#C5AE98]"} py-6 text-center text-white`}>
      <h2 className="text-lg md:text-2xl font-[Inter] mb-2 md:mb-3">
        Contact Us
      </h2>
      <div className="flex justify-center gap-10 md:gap-12 text-lg md:text-2xl">
        <a href="https://maps.google.com/maps?q=Sacramento+CA" target="_blank" rel="noopener noreferrer">
          <FaMapMarkerAlt />
        </a>

        <button 
          type="button"
          onClick={() => setIsContactFormOpen(true)}
          className="cursor-pointer"
          aria-label="Open contact form"
        >
          <FaEnvelope />
        </button>

        <a href="https://instagram.com/kingssoap" target="_blank" rel="noopener noreferrer">
          <FaInstagram />
        </a>
      </div>

      

      <ContactForm
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
      />

    </footer>
  );
}

export default Footer;