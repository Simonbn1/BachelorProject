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
  } = useRegister();

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Lag en konto</h2>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Fullt navn (fornavn og etternavn)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={error?.includes("navn") ? "input-error" : ""}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={error?.includes("email") ? "input-error" : ""}
          />

          <input
            type="password"
            placeholder="Passord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={
              (password && password.length < 8) ||
              (password && !/[a-zA-ZæøåÆØÅ]/.test(password)) ||
              error?.includes("Passord") ||
              error?.includes("password")
                ? "input-error"
                : ""
            }
          />

          <input
            type="password"
            placeholder="Gjenta passord"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={
              (confirmPassword && password !== confirmPassword) ||
              error?.includes("gjenta") ||
              error?.includes("stemmer")
                ? "input-error"
                : ""
            }
          />
          <p>
            Har du allerede en konto? <Link to="/login">Login</Link>
          </p>

          {error && <p className="input-hint">{error}</p>}

          <button type="submit">Registrer</button>
        </form>
      </div>
    </div>
  );
}
