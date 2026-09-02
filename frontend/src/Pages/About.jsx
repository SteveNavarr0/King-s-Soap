import AboutImage from '../components/AboutPageImage';
import SoapVideo from '../components/SoapVideo';

const About = () => {
  return (
      <div>
  <div className="max-w-7xl mx-auto px-6 mb-30">
    <AboutImage />
  </div>

  <div className="max-w-7xl mx-auto px-6 mb-30">
    <h1 className="text-4xl text-white font-[Inria_Serif] text-center">
      About Us
    </h1>
    <div className="w-full flex items-center justify-center mt-6">
      <p className="text-xl text-white font-[Inria_Serif] text-center max-w-3xl leading-relaxed">
        Founded in 2016, King’s Soap is a family-owned business creating carefully formulated, handcrafted soaps in small batches. 
        We offer a range of options, including all-natural and organic selections, and avoid harsh chemicals in every bar. 
      </p>
    </div>
    <div className="w-full mt-6 leading-none">
      <SoapVideo />
    </div>
  </div>

  <div className="max-w-7xl mx-auto px-6 mb-30">
    <h1 className="text-4xl text-white font-[Inria_Serif] text-center">
      About Anita King
    </h1>
    <div className="w-full flex items-center justify-center mt-6">
      <p className="text-xl text-white font-[Inria_Serif] text-center max-w-3xl leading-relaxed">
        I have been a wife, mother, and homemaker for the past 37 years. Now that my children are grown,
        I have had time to explore new hobbies. In 2016, I came across handcrafted soaps at a craft fair and developed a desire to learn more.
        After doing much research and experimentation, I finally began to turn that knowledge into something of my own, leading to the creation of King's Soap.
      </p>
    </div>
  </div>

  <div className="max-w-7xl mx-auto px-6">
    <h1 className="text-4xl text-white font-[Inria_Serif] text-center">
      Contact Me
    </h1>
    <div className="w-full flex items-center justify-center mt-6 pb-30">
      <a href="mailto:kinganita25@gmail.com" className="mx-8 text-xl text-black font-[Inria_Serif] w-52 h-15 bg-white px-4 py-2 rounded cursor-pointer flex items-center justify-center">
        Email
      </a>
      <a href="tel:19168569659" className="mx-8 text-xl text-black font-[Inria_Serif] w-52 h-15 bg-white px-4 py-2 rounded cursor-pointer flex items-center justify-center">
        Mobile
      </a>
      <a href="https://instagram.com/kingssoap" target="_blank" rel="noopener noreferrer" className="mx-8 text-xl text-black font-[Inria_Serif] w-52 h-15 bg-white px-4 py-2 rounded cursor-pointer flex items-center justify-center">
        Instagram
      </a>
    </div>
  </div>
</div>
  );
};

export default About;