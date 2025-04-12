import { useEffect, useState } from "react";
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

import { supabase } from "./supabaseClient";

import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      setLoading(true); // Start loading
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false); // Stop loading
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setLoading(false); // Stop loading when auth state changes
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <Loading />;
  if (!session) return <Login />;
  return (
    <>
      <Router>
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
