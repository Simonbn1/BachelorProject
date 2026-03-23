import "./LoginPage.css";
import { useState } from "react";
import { login } from "../api/authApi";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await login(email, password);
      localStorage.setItem("accessToken", res.accessToken);
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Login</h2>

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

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}
