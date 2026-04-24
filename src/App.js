import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./store/ThemeContext";
import { AuthProvider, useAuth } from "./store/AuthContext";
import { ToastProvider } from "./store/ToastContext";
import "./App.css";

import Dashboard from "./screens/Dashboard";
import Transactions from "./screens/Transactions";
import AddTransaction from "./screens/AddTransaction";
import Reports from "./screens/Reports";
import Settings from "./screens/Settings";
import Login from "./screens/Login";
import Categories from "./screens/Categories";
import Payees from "./screens/Payees";
import QuickTransactions from "./screens/QuickTransactions";
import Budgets from "./screens/Budgets";
import Goals from "./screens/Goals";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-transaction"
                element={
                  <ProtectedRoute>
                    <AddTransaction />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payees"
                element={
                  <ProtectedRoute>
                    <Payees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quick-transactions"
                element={
                  <ProtectedRoute>
                    <QuickTransactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/budgets"
                element={
                  <ProtectedRoute>
                    <Budgets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <ProtectedRoute>
                    <Goals />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </ThemeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
