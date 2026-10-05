import {FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaInstagram} from "react-icons/fa";
import ContactForm from "../components/ContactForm";
import {useState} from "react";


function Footer() {

  const[isContactFormOpen, setIsContactFormOpen] = useState(false);


  return (
    <footer className="bg-[#C5AE98] py-6 text-center text-[#FFFFFF]">
      
      <h2 className="text-2xl font-[Inter] mb-3">
        Contact Us
      </h2>

      <div className="flex justify-center gap-8 text-2xl">
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

        <a href="tel:19168569659">
          <FaPhoneAlt />
        </a>

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