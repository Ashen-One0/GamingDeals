import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toaster } from "sonner";
import "./i18n";

import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import DealsPage from "./pages/DealsPage";
import LoginPage from "./pages/LoginPage";
import WishlistPage from "./pages/WishlistPage";
import AlertsPage from "./pages/AlertsPage";
import AuthCallback from "./pages/AuthCallback";

const AppRouter = () => {
  const location = useLocation();
  // CRITICAL: handle session_id in fragment BEFORE normal routes
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/dashboard" element={<HomePage />} />
      </Routes>
    </>
  );
};

const LangSync = () => {
  const { i18n } = useTranslation();
  useEffect(() => {
    const lng = i18n.language?.slice(0, 2) || "en";
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lng;
  }, [i18n.language]);
  return null;
};

function App() {
  return (
    <div className="App min-h-screen bg-white dark:bg-[#09090B] text-zinc-900 dark:text-white">
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <LangSync />
            <AppRouter />
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
