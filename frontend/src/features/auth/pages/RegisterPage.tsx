import "./RegisterPage.css";
import { Link } from "react-router-dom";
import { useRegister } from "../hooks/useRegister";

export default function RegisterPage() {
  const {
    displayName,
    setDisplayName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleRegister,
    error,
    errorField,
  } = useRegister();

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
          <h1>Lag en konto</h1>
          <p>Opprett bruker for å komme i gang med timeføring.</p>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          <input
            type="text"
            placeholder="Fullt navn"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={errorField === "name" ? "input-error" : ""}
          />

          <input
            type="email"
            placeholder="navn@accenture.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errorField === "email" ? "input-error" : ""}
          />

          <input
            type="password"
            placeholder="Passord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errorField === "password" ? "input-error" : ""}
          />

          <input
            type="password"
            placeholder="Gjenta passord"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={errorField === "confirmPassword" ? "input-error" : ""}
          />

          {error && <p className="input-hint">{error}</p>}

          <p className="login-register">
            Har du allerede en konto? <Link to="/login">Logg inn</Link>
          </p>

          <button type="submit">Registrer</button>
        </form>
      </div>
    </div>
  );
}
