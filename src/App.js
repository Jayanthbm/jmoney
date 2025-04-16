// src/App.js

import { useEffect, useRef, useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import Transactions from "./pages/Transactions/Transactions";
import Overview from "./pages/Overview/Overview";
import Budgets from "./pages/Budgets/Budgets";
import Goals from "./pages/Goals/Goals";
import Reports from "./pages/Reports/Reports";
import Settings from "./pages/Settings/Settings";
import Loading from "./components/Layouts/Loading";
import MainLayout from "./components/Layouts/MainLayout";
import Button from "./components/Button/Button";
import { supabase } from "./supabaseClient";
import { FiDownload } from "react-icons/fi";
import "./App.css";

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

  const iosTimeoutRef = useRef(null);
  // Detect if app is already installed
  const isPwaInstalled = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  // Detect iOS
  const isIos = () =>
    /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

  useEffect(() => {
    if (isPwaInstalled()) {
      // Don't show any install prompt if already installed
      return;
    }

    if (isIos()) {
      setShowIosInstallGuide(true); // iOS custom message
      iosTimeoutRef.current = setTimeout(() => {
        setShowIosInstallGuide(false);
      }, 10000);
    } else {
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallPrompt(true); // Android-style install banner
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      };
    }

    // Clear timeout if component unmounts
    return () => {
      if (iosTimeoutRef.current) {
        clearTimeout(iosTimeoutRef.current);
      }
    };
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

  if (loading) return <Loading />;
  if (!session) return <Login />;
  return (
    <>
      <Router>
        {showInstallPrompt && (
          <div className="pwa-install-banner">
            <span>Install this app for a better experience.</span>
            <Button
              variant="info"
              onClick={handleInstallClick}
              text="Install"
              icon={<FiDownload />}
            />
          </div>
        )}
        {showIosInstallGuide && (
          <div className={`pwa-install-banner fade-in-out`}>
            <span>
              To install this app, tap <strong>Share</strong> and choose{" "}
              <strong>"Add to Home Screen"</strong> in Safari.
            </span>
            <button
              className="close-btn"
              onClick={() => {
                if (iosTimeoutRef.current) {
                  clearTimeout(iosTimeoutRef.current);
                }
                setShowIosInstallGuide(false);
              }}
            >
              &times;
            </button>
          </div>
        )}
        <MainLayout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </MainLayout>
      </Router>
    </>
  );
}

export default App;
