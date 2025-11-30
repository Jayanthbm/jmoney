// src/App.js

import "./App.css";

import { Route, HashRouter as Router, Routes } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";

import Loading from "./components/Loader/Loading";
import MainLayout from "./components/Layouts/MainLayout";
import PwaBanner from "./components/Views/PwaBanner";
import { supabase } from "./supabaseClient";

// Lazy load pages
const Overview = lazy(() => import("./pages/Overview/Overview"));
const Transactions = lazy(() => import("./pages/Transactions/Transactions"));
const Budgets = lazy(() => import("./pages/Budgets/Budgets"));
const Goals = lazy(() => import("./pages/Goals/Goals"));
const Reports = lazy(() => import("./pages/Reports/Reports"));
const Settings = lazy(() => import("./pages/Settings/Settings"));
const Login = lazy(() => import("./pages/Login/Login"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

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
      (_, session) => {
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
    const dismissedRecently =
      lastDismissed && Date.now() - Number(lastDismissed) < 24 * 60 * 60 * 1000;

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
      return () =>
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
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
  if (!session)
    return (
      <Suspense fallback={<Loading />}>
        <Login />
      </Suspense>
    );

  return (
    <>
      <Router>
        <PwaBanner
          showInstallPrompt={showInstallPrompt}
          showIosInstallGuide={showIosInstallGuide}
          handleInstallClick={handleInstallClick}
          onClose={handleCloseModal}
        />
        <MainLayout>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </MainLayout>
      </Router>
    </>
  );
}

export default App;
