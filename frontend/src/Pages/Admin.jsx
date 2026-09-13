import { Link } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminNav from "../components/AdminNav";


function Admin() {
  return (
    <div className="min-h-screen"> {/* Container for the admin page */}
      
      <AdminHeader />
      
      <div className="flex flex-col justify-left mt-8 ml-8 md:ml-13 text-white">

        <h1 className="text-3xl md:text-5xl font-serif">
          Welcome, Anita
        </h1>

        <p className="text-base font-serif md:text-xl leading-relaxed">
          Here's your shop at a glance
        </p>
      </div>
      
      <AdminNav />
      
    </div>
  );
}

export default Admin;
