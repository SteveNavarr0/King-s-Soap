import AboutImage from '../components/AboutPageImage';
import SoapVideo from '../components/SoapVideo';
import ContactForm from "../components/ContactForm";
import {useState} from "react";

const About = () => {

  const[isContactFormOpen, setIsContactFormOpen] = useState(false);





   return (
      <div className="pt-28 md:pt-40">
  <div className="max-w-7xl mx-auto px-6 mb-15 md:mb-30">
    <AboutImage />
  </div>


  <div className="max-w-7xl mx-auto px-6 mb-15 md:mb-30">
    <h1 className="text-3xl md:text-4xl text-white font-serif text-center">
      About Us
    </h1>
    <div className="w-full flex items-center justify-center mt-3">
      <p className="text-base md:text-xl text-white font-[Inria_Serif] text-center max-w-3xl leading-relaxed">
        Founded in 2016, King’s Soap is a family-owned business creating carefully formulated, handcrafted soaps in small batches. 
        We offer a range of options, including all-natural and organic selections, and avoid harsh chemicals in every bar. 
      </p>
    </div>
    <div className="w-full mt-6 leading-none">
      <SoapVideo />
    </div>
  </div>

  <div className="max-w-7xl mx-auto px-6 mb-15 md:mb-30">
    <h1 className="text-3xl md:text-4xl text-white font-serif text-center">
      About Anita King
    </h1>
    <div className="w-full flex items-center justify-center mt-3">
      <p className="text-base md:text-xl text-white font-[Inria_Serif] text-center max-w-3xl leading-relaxed">
        I have been a wife, mother, and homemaker for the past 37 years. Now that my children are grown,
        I have had time to explore new hobbies. In 2016, I came across handcrafted soaps at a craft fair and developed a desire to learn more.
        After doing much research and experimentation, I finally began to turn that knowledge into something of my own, leading to the creation of King's Soap.
      </p>
    </div>
  </div>

  <div className="max-w-7xl mx-auto px-6">
      <h1 className="text-3xl md:text-4xl text-white font-serif text-center">
      Contact Me
    </h1>
    <div className="w-full flex flex-col items-center justify-center gap-4 mt-3 md:mt-6 pb-15 md:flex-row md:gap-0 md:pb-30">
     
      <button 
        type="button"
        onClick={() => setIsContactFormOpen(true)}
         className="mx-8 text-xl text-white font-serif w-[140px] md:w-52 h-10 md:h-15 bg-white/15 border border-white/20 px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center transition hover:scale-105">
        Email
      </button>

      <a href="https://instagram.com/kingssoap" target="_blank" rel="noopener noreferrer" className="mx-8 text-xl text-white font-serif w-[140px] md:w-52 h-11 md:h-15 bg-white/15 border border-white/20 px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center transition hover:scale-105">
        Instagram
      </a>

    </div>
  </div>

  <div>
    <ContactForm
      isOpen={isContactFormOpen}
      onClose={() => setIsContactFormOpen(false)}
      />
  </div>
  

</div>
  );
};

export default About;