import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AdminDeleteProduct from "./Pages/AdminDeleteProduct";
import AdminUpdateWebsitePhoto from "./Pages/AdminUpdateWebsitePhoto";
import OldUIAdminDeleteProduct from "./Pages/OldUIAdminDeleteProduct.jsx";
function App() {
  return (
    <BrowserRouter>
      <Navbar />

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
            <Route path="/OldUIAdminDeleteProduct" element={<OldUIAdminDeleteProduct />} />
            <Route path="/adminUpdateProduct" element={<AdminUpdateProduct />} />
            <Route path="/adminDeleteProduct" element={<AdminDeleteProduct />} />
            <Route
              path="/adminUpdateWebsitePhoto"
              element={<AdminUpdateWebsitePhoto />}
            />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;