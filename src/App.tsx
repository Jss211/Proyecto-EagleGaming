import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CarouselProvider } from "./context/CarouselContext";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./components/login/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { TermsPage } from "./pages/Terms.Page";
import { PrivacyPage } from "./pages/PrivacyPage";
import { HomePage } from "./pages/HomePage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CategoryPage } from "./pages/CategoryPage";
import { SearchResultsPage } from "./pages/SearchResultsPage";

function App() {
  return (
    <CarouselProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          <Route path="/categoria/:id" element={<CategoryPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="/buscar" element={<SearchResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CarouselProvider>
  );
}

export default App;