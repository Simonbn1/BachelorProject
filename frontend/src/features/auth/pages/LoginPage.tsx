import "./LoginPage.css";
import { useState } from "react";
import { login } from "../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import { saveAuth } from "../types/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await login(email, password);
      saveAuth(res);
      navigate("/timesheet", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p style={{ marginTop: "1rem", textAlign: "center" }}>
            No account? <Link to="/register">Create one</Link>
          </p>

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
