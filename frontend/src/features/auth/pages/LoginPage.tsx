import "./LoginPage.css";
import { Link } from "react-router-dom";
import { useLogin } from "../hooks/useLogin.ts";

export default function LoginPage() {
  const { email, setEmail, password, setPassword, handleLogin } = useLogin();

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
            Ingen konto? <Link to="/register">Lag en</Link>
          </p>

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
