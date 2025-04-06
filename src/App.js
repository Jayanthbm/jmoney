import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Overview from "./Overview";
import Transactions from "./Transactions";
import Settings from "./Settings";
import Reports from "./Reports";
import Login from "./Login";
import Budgets from "./Budgets";
import Goals from "./Goals";
import MainLayout from "./components/MainLayout";
import Loading from "./components/Loading";

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
