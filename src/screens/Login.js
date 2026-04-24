import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, supabase } from "../store/AuthContext";
import { Card, Button, Input } from "../components/Common";
import { useToast } from "../store/ToastContext";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter both email and password.", "error");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-inner">
        <div className="login-header">
          <h1 className="login-title">Jmoney</h1>
          <p className="login-subtitle">Manage your finances effortlessly</p>
          <p className="login-version">v1.2.1</p>
        </div>

        <Card className="login-card">
          <form onSubmit={handleLogin}>
            <div className="input-with-icon">
              <Mail size={20} className="field-icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />
            </div>

            <div className="input-with-icon">
              <Lock size={20} className="field-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button type="submit" disabled={loading} className="login-submit">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
