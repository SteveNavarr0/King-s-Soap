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
<<<<<<< HEAD
<<<<<<< Updated upstream
import { Product1, Product2, Product3, Product4, Product5, Product6 } from "./Pages/ProductPages";

=======
import PaymentSuccessful from "./Pages/PaymentSuccessful";
import ProductPage from "./Pages/ProductPage.jsx";
>>>>>>> Stashed changes


//const Home = () => {
 // return <div style={{ width: "100%", height: "100%" }} />;
//};
=======
import PaymentSuccessful from "./Pages/PaymentSuccessful";
import ProductPage from "./Pages/ProductPage.jsx";
import Admin from "./Pages/Admin";
import AdminCreateProduct from "./Pages/AdminCreateProduct";
import AdminUpdateProduct from "./Pages/AdminUpdateProduct";
import AdminDeleteProduct from "./Pages/AdminDeleteProduct";
import AdminUpdateWebsitePhoto from "./Pages/AdminUpdateWebsitePhoto";

>>>>>>> 1f82f01827b466b64949de2d1ca5c4599d8c60a9
function App() {
  return (
    <BrowserRouter>
      <Navbar />

<<<<<<< HEAD
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
<<<<<<< Updated upstream
        <Route path="/Product1" element={<Product1 />} />
        <Route path="/Product2" element={<Product2 />} />
        <Route path="/Product3" element={<Product3 />} />
        <Route path="/Product4" element={<Product4 />} />
        <Route path="/Product5" element={<Product5 />} />
        <Route path="/Product6" element={<Product6 />} />
=======
        <Route path="/paymentSuccessful" element={<PaymentSuccessful />} />
        <Route path="/product/:id" element={<ProductPage />} />
>>>>>>> Stashed changes



      </Routes>
=======
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
            <Route path="/adminUpdateProduct" element={<AdminUpdateProduct />} />
            <Route path="/adminDeleteProduct" element={<AdminDeleteProduct />} />
            <Route
              path="/adminUpdateWebsitePhoto"
              element={<AdminUpdateWebsitePhoto />}
            />
          </Routes>
>>>>>>> 1f82f01827b466b64949de2d1ca5c4599d8c60a9
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;