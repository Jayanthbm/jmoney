// src/pages/Login/Login.js

import "./login.css";

import { supabase } from "../../supabaseClient";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login failed:", error);
      setErrorMsg(error.message);
    } else {
      console.log("Login successful");
      // You can redirect or update global auth state here
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <h2>Login to jmoney</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {errorMsg && <p className="error-message">{errorMsg}</p>}
      </form>
    </div>
  );
};

export default Login;
