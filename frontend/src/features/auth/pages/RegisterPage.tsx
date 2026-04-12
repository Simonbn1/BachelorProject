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
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Passord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password && password.length < 8 && (
            <p className="input-hint">Passordet må være minst 8 tegn</p>
          )}

          <input
            type="password"
            placeholder="Gjenta passord"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="input-hint">Passordene stemmer ikke overens</p>
          )}

          <p>
            Har du allerede en konto? <Link to="/login">Login</Link>
          </p>

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}
