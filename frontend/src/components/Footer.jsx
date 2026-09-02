import {FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaInstagram} from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-[#C5AE98] py-6 text-center text-[#FFFFFF]">
      
      <h2 className="text-2xl font-[Inter] mb-3">
        Contact Us
      </h2>

      <div className="flex justify-center gap-8 text-2xl">
        <a href="https://maps.google.com/maps?q=Sacramento+CA" target="_blank" rel="noopener noreferrer">
          <FaMapMarkerAlt />
        </a>

        <a href="mailto:kinganita25@gmail.com">
          <FaEnvelope />
        </a>

        <a href="tel:19168569659">
          <FaPhoneAlt />
        </a>

        <a href="https://instagram.com/kingssoap" target="_blank" rel="noopener noreferrer">
          <FaInstagram />
        </a>
      </div>

      <p className="mt-3 mb-3 text-md font-[Inter]">
        Sacramento, CA • kinganita25@gmail.com • (916) 856-9659 • @kingssoap
      </p>

    </footer>
  );
}

export default Footer;