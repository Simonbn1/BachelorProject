import "./RegisterPage.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/authApi";
import { saveAuth } from "../types/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await register(displayName, email, password);
      saveAuth(res);

      if (res.user.roles.includes("ADMIN")) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/timesheet", { replace: true });
      }
    } catch (err) {
      console.error(err);
      alert("Register failed");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Create account</h2>

        <form onSubmit={handleRegister}>
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

          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}
