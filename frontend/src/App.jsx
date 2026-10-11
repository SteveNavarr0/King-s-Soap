import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

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
import RequestCancellation from "./Pages/RequestCancellation.jsx";
import ProductPage from "./Pages/ProductPage.jsx";
import Admin from "./Pages/Admin";
import AdminProducts from "./Pages/AdminProducts.jsx";
import AdminInbox from "./Pages/AdminInbox.jsx";
import AdminDiscounts from "./Pages/AdminDiscounts";
import OldUIAdminDeleteProduct from "./Pages/OldUIAdminDeleteProduct.jsx";
import CoconutOilShop from "./Pages/CoconutOilShop.jsx";
import OrganicShop from "./Pages/OrganicShop.jsx";
import AllNaturalShop from "./Pages/AllNaturalShop.jsx";
import LipBalmShop from "./Pages/LipBalmShop.jsx";
import SoapDishShop from "./Pages/SoapDishShop.jsx";
import AdminOrders from "./Pages/AdminOrders.jsx";
import AdminArchivedOrders from "./Pages/AdminArchivedOrders.jsx";
import AdminPostagePage from "./Pages/AdminShipping.jsx";
import AdminArchive from "./Pages/AdminArchive.jsx";
import AdminOrderDetails from "./Pages/AdminOrderDetails.jsx";

function AppContent({ children }) {
  const location = useLocation();
  const isAdminPage = location.pathname
    .toLowerCase()
    .startsWith("/admin");

  return isAdminPage ? null : children;
}

function CartRouteLayer({ children }) {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <div className={backgroundLocation ? "hidden md:block" : ""}>
        {children(backgroundLocation || location)}
      </div>

      {backgroundLocation && <Cart />}
    </>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AppContent>
        <Navbar />
      </AppContent>

      <div className="relative flex flex-col min-h-screen">
         <div className="flex-grow">
          <CartRouteLayer>
            {(routeLocation) => (
              <Routes location={routeLocation}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cart" element={<Cart />} />
                <Route
                  path="/userAccount"
                  element={
                    <ProtectedRoute>
                      <UserAccount />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/userChangePassword"
                  element={<UserChangePassword />}
                />
                <Route
                  path="/userChangeAddress"
                  element={<UserChangeAddress />}
                />
                <Route path="/verifyaccount" element={<VerifyAccount />} />
                <Route path="/createaccount" element={<CreateAccount />} />
                <Route path="/emailToPWReset" element={<EmailToPWReset />} />
                <Route
                  path="/paymentSuccessful"
                  element={<PaymentSuccessful />}
                />
                <Route
                  path="/PaymentSuccessful"
                  element={<PaymentSuccessful />}
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <UserAccount />
                    </ProtectedRoute>
                  }
                />
                <Route
              path="/request-cancellation"
              element={<RequestCancellation />}
            />
            <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/admin" element={<Admin />} />
                
                
                <Route path="/adminInbox" element = {<AdminInbox/>}/>
                <Route path="/adminProducts" element={<AdminProducts />} />
                <Route path="/AdminProducts" element={<AdminProducts />} />
                <Route
                  path="/OldUIAdminDeleteProduct"
                  element={<OldUIAdminDeleteProduct />}
                />
                <Route
                  path="/adminDiscounts"
                  element={< AdminDiscounts />}
                />
                <Route path="/coconutOilShop" element={<CoconutOilShop />} />
                <Route path="/organicShop" element={<OrganicShop/>} />
                <Route path="/allNaturalShop" element={<AllNaturalShop/>} />
                <Route path="/lipBalmShop" element={<LipBalmShop/>} />
                <Route path="/soapDishShop" element={<SoapDishShop/>} />
                <Route path="/adminOrders" element={<AdminOrders/>} />
                <Route path="/adminArchivedOrders" element={<AdminArchivedOrders/>} />
                <Route path="/adminArchive" element={<AdminArchive />}/>
                <Route path="/AdminArchive" element={<AdminArchive />}/>
                <Route path="/admin/shipping" element={<AdminPostagePage />} />
                <Route path="/adminShipping" element={<AdminPostagePage />} />
                <Route path="/AdminShipping" element={<AdminPostagePage />} />
                <Route path="/AdminPostage" element={<AdminPostagePage />} />
                <Route path="/adminPostage" element={<AdminPostagePage />} />
                <Route path="/adminOrders/:id" element={<AdminOrderDetails />}/>
              </Routes>
            )}
          </CartRouteLayer>
        </div>

        <AppContent>
          <Footer />
        </AppContent>
      </div>
    </BrowserRouter>
  );
}

export default App;