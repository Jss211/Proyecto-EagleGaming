import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CarouselProvider } from "./context/CarouselContext";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./components/login/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { TermsPage } from "./pages/Terms.Page";
import { PrivacyPage } from "./pages/PrivacyPage";
import { HomePage } from "./pages/HomePage";

function App() {
  return (
    <CarouselProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CarouselProvider>
  );
}

export default App;