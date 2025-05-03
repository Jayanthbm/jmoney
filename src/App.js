// src/App.js

import "./App.css";

import { Route, HashRouter as Router, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import Budgets from "./pages/Budgets/Budgets";
import Categories from "./pages/Categories/Categories";
import Goals from "./pages/Goals/Goals";
import Loading from "./components/Layouts/Loading";
import Login from "./pages/Login/Login";
import MainLayout from "./components/Layouts/MainLayout";
import Overview from "./pages/Overview/Overview";
import Payees from "./pages/Payees/Payees";
import PwaBanner from "./components/Views/PwaBanner";
import Reports from "./pages/Reports/Reports";
import Settings from "./pages/Settings/Settings";
import Transactions from "./pages/Transactions/Transactions";
import { supabase } from "./supabaseClient";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showIosInstallGuide, setShowIosInstallGuide] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Detect if app is already installed
  const isPwaInstalled = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  // Detect iOS
  const isIos = () =>
    /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

  useEffect(() => {
    const lastDismissed = localStorage.getItem("pwaDismissedAt");
    const dismissedRecently = lastDismissed && Date.now() - Number(lastDismissed) < 24 * 60 * 60 * 1000;

    if (dismissedRecently || isPwaInstalled()) return;

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIos() || (isSafari && /mac/i.test(navigator.userAgent))) {
      setShowIosInstallGuide(true); // iOS custom message
    } else {
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallPrompt(true);
      };
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("PWA installed");
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleCloseModal = () => {
    localStorage.setItem("pwaDismissedAt", Date.now());
    setShowIosInstallGuide(false);
    setShowInstallPrompt(false);
  };

  if (loading) return <Loading />;
  if (!session) return <Login />;

  return (
    <>
      <Router>
        <PwaBanner showInstallPrompt={showInstallPrompt} showIosInstallGuide={showIosInstallGuide} handleInstallClick={handleInstallClick} onClose={handleCloseModal} />
        <MainLayout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/payees" element={<Payees />} />
          </Routes>
        </MainLayout>
      </Router>
    </>
  );
}

export default App;
