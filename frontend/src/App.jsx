import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import Shop from "./Pages/Shop";
import About from "./Pages/About";
import Cart from "./Pages/Cart";
import Login from "./Pages/Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import VerifyAccount from "./Pages/VerifyAccount";
import CreateAccount from "./Pages/CreateAccount";
import EmailToPWReset from "./Pages/EmailToPWReset";
import UserAccount from "./Pages/UserAccount";
import UserChangePassword from "./Pages/UserChangePassword";
import UserChangeAddress from "./Pages/UserChangeAddress";
import PaymentSuccessful from "./Pages/PaymentSuccessful";
import ProductPage from "./Pages/ProductPage.jsx";
import Admin from "./Pages/Admin";
import AdminCreateProduct from "./Pages/AdminCreateProduct";
import AdminUpdateProduct from "./Pages/AdminUpdateProduct";
import AdminProducts from "./Pages/AdminProducts.jsx";
import AdminUpdateWebsitePhoto from "./Pages/AdminUpdateWebsitePhoto";

function AppContent({ children }) {
  const location = useLocation();
  const isAdminPage = location.pathname.toLowerCase().startsWith('/admin'); // Check if the current path starts with '/admin'

  return isAdminPage ? null : children; //If it's an admin page, don't render the children (Navbar and Footer), otherwise render them
}


function App() {
  return (
    <BrowserRouter>
      
      <AppContent> {/* Makes the navbar a child */}
        <Navbar />
      </AppContent>

      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/userAccount" element={<UserAccount />} />
            <Route path="/userChangePassword" element={<UserChangePassword />} />
            <Route path="/userChangeAddress" element={<UserChangeAddress />} />
            <Route path="/verifyaccount" element={<VerifyAccount />} />
            <Route path="/createaccount" element={<CreateAccount />} />
            <Route path="/emailToPWReset" element={<EmailToPWReset />} />
            <Route path="/paymentSuccessful" element={<PaymentSuccessful />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/adminCreateProduct" element={<AdminCreateProduct />} />
            <Route path="/adminUpdateProduct/:id" element={<AdminUpdateProduct />} /> {/* Dynamic url for whatever product is clicked */}
            <Route path="/adminProducts" element={<AdminProducts />} />
            <Route
              path="/adminUpdateWebsitePhoto"
              element={<AdminUpdateWebsitePhoto />}
            />
          </Routes>
        </div>

      <AppContent> {/* Makes the footer a child */}
        <Footer />
      </AppContent>
        
      </div>
    </BrowserRouter>
  );
}

export default App;