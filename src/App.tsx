import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useEffect } from "react";

import { CarouselProvider } from "./context/CarouselContext";
import { CartProvider } from "./context/CartContext";

import { HomePage } from "./pages/HomePage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CategoryPage } from "./pages/CategoryPage";
import { CartPage } from "./pages/CartPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./components/login/LoginPage";
import { AccountPage } from "./pages/AccountPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { TermsPage } from "./pages/Terms.Page";
import { PrivacyPage } from "./pages/PrivacyPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { SearchResultsPage } from "./pages/SearchResultsPage";
import { Chatbot } from "./chatbot-frontend/Chatbot";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <CartProvider>
      <CarouselProvider>
        <BrowserRouter>
          <ScrollToTop />

          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route
              path="/producto/:id"
              element={<ProductDetailPage />}
            />

            <Route
              path="/categoria/:id"
              element={<CategoryPage />}
            />

            <Route
              path="/categoria/:id/:subcategoria"
              element={<CategoryPage />}
            />

            <Route path="/carrito" element={<CartPage />} />

            <Route path="/nosotros" element={<AboutPage />} />

            <Route path="/contactenos" element={<ContactPage />} />

            <Route path="/buscar" element={<SearchResultsPage />} />

            <Route path="/register" element={<RegisterPage />} />

            <Route path="/login" element={<LoginPage />} />

            <Route path="/cuenta" element={<AccountPage />} />

            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage />}
            />

            <Route path="/terminos" element={<TermsPage />} />

            <Route path="/privacidad" element={<PrivacyPage />} />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
          <Chatbot />
        </BrowserRouter>
      </CarouselProvider>
    </CartProvider>
  );
}
