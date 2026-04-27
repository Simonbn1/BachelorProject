import "./LoginPage.css";
import { Link } from "react-router-dom";
import { useLogin } from "../hooks/useLogin.ts";

export default function LoginPage() {
  const { email, setEmail, password, setPassword, handleLogin } = useLogin();

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">
            accenture<span>&gt;</span>
          </div>
          <p>Timeføring</p>
        </div>

        <div className="login-header">
          <h1>Velkommen tilbake</h1>
          <p>Logg inn for å føre timer og administrere uken din.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="navn@accenture.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Passord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p className="login-register">
            Ingen konto? <Link to="/register">Lag en</Link>
          </p>

          <button type="submit">Logg inn</button>
        </form>
      </div>
    </div>
  );
}
