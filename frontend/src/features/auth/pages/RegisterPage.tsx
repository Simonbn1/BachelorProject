import "./LoginPage.css";
import { useState } from "react";
import { register } from "../api/authApi";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await register({
        displayName,
        email,
        password,
      });

      localStorage.setItem("accessToken", res.accessToken);
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Register failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Create account</h2>

        <input
          type="text"
          placeholder="Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

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
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <button onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
}
