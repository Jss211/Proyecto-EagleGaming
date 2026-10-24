import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { useEffect } from "react";

import { CarouselProvider } from "./context/CarouselContext";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

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
import { ArmaTuPCPage } from "./pages/ArmaTuPCPage";
import { LibroDeReclamacionesPage } from "./pages/LibroDeReclamacionesPage";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminPanel } from "./pages/AdminPanel";
import { AdminRoute } from "./components/AdminRoute";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useDynamicTitle } from "./hooks/useDynamicTitle";
// import { Chatbot } from "./chatbot-frontend/Chatbot";

function PageNavigationHandler() {
  const { pathname } = useLocation();
  useDynamicTitle();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function ConditionalChatbot() {
  // Desactivado temporalmente por solicitud del usuario
  return null;
}

export default function App() {
  return (
    <AuthProvider>
    <CartProvider>
      <CarouselProvider>
        <ErrorBoundary>
        <BrowserRouter>
          <PageNavigationHandler />

          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/admin-login" element={<AdminLogin />} />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />

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

            <Route path="/arma-tu-pc" element={<ArmaTuPCPage />} />

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

            <Route path="/libro-de-reclamaciones" element={<LibroDeReclamacionesPage />} />
            <Route path="/reclamaciones" element={<LibroDeReclamacionesPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ConditionalChatbot />
        </BrowserRouter>
      </ErrorBoundary>
      </CarouselProvider>
    </CartProvider>
    </AuthProvider>
  );
}
