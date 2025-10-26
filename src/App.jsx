import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WelcomePage from "./pages/WelcomePage";
import Callback from "./pages/Callback";
import Items from "./pages/Items";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import ProtectedRoute from "./ProtectedRoute";
import { CartProvider } from "./context/CartContext";
import Payments from "./pages/Payments";
import AdminItems from "./pages/AdminItems";
import ErrorBoundary from './components/ErrorBoundary';
import ApiErrorHandler from './components/ApiErrorHandler';
import FirstVisitRedirect from "./FirstVisitRedirect";


function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <Router>
          <ApiErrorHandler />
          <Header />

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/innowise-shop" element={<WelcomePage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/items" element={<Items />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/payments" element={<Payments />} />
            </Route>
            <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
              <Route path="/admin/items" element={<AdminItems />} />
            </Route>
            <Route path="*" element={<FirstVisitRedirect />} />
          </Routes>
        </Router>
      </CartProvider>
    </ErrorBoundary>
  );
}


export default App;
