import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { Camera, Check, Eye, EyeOff, Lock, User, X } from "lucide-react";
import "../styles/SettingsPage.css";

export default function SettingsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<
    "name" | "password" | null
  >(null);

  const [name, setName] = useState("Test User");
  const [nameInput, setNameInput] = useState("Test User");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);

  const [nameSuccess, setNameSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  }

  function handleNameSave() {
    if (!nameInput.trim()) return;
    setName(nameInput.trim());
    setNameSuccess(true);
    setTimeout(() => {
      setNameSuccess(false);
      setActiveSection(null);
    }, 1500);
  }

  function handlePasswordSave() {
    setPasswordError(null);
    if (!currentPassword) {
      setPasswordError("Skriv inn nåværende passord.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Nytt passord må være minst 8 tegn.");
      return;
    }

    if (newPassword !== repeatPassword) {
      setPasswordError("Passordene stemmer ikke overens.");
      return;
    }
    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setRepeatPassword("");
    setTimeout(() => {
      setPasswordSuccess(false);
      setActiveSection(null);
    }, 1500);
  }

  function cancelSection() {
    setActiveSection(null);
    setNameInput(name);
    setCurrentPassword("");
    setNewPassword("");
    setRepeatPassword("");
    setPasswordError(null);
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="page settings-page">
      <div className="page-intro">
        <div className="page-intro-text">
          <button
            className="page-back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Oversikt
          </button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-box">
          <h1 className="page-title">Innstillinger</h1>
          <p className="page-subtitle">
            Administrer profilen din og kontoinformasjon.
          </p>
          <div className="settings-section-header">
            <h2 className="settings-section-title">Rediger profil</h2>
          </div>
          <div className="settings-card">
            <div className="settings-avatar-section">
              <div
                className="settings-avatar-wrap"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profilbilde"
                    className="settings-avatar-img"
                  />
                ) : (
                  <div className="settings-avatar-placeholder">{initials}</div>
                )}
                <div className="settings-avatar-overlay">
                  <Camera size={20} />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
              <div className="settings-avatar-info">
                <span className="settings-avatar-name">{name}</span>
                <span className="settings-avatar-hint">
                  Klikk på bildet for å endre
                </span>
              </div>
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div className="settings-row-left">
                <div className="settings-row-icon">
                  <User size={18} />
                </div>
                <div>
                  <div className="settings-row-label">Navn</div>
                  <div className="settings-row-value">{name}</div>
                </div>
              </div>
              {activeSection !== "name" && (
                <button
                  className="settings-edit-btn"
                  onClick={() => {
                    setActiveSection("name");
                    setNameInput(name);
                  }}
                >
                  Endre
                </button>
              )}
            </div>

            {activeSection === "name" && (
              <div className="settings-edit-section">
                <input
                  className="settings-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Fullt navn"
                  autoFocus
                />

                <div className="settings-edit-actions">
                  <button
                    className="settings-save-btn"
                    onClick={handleNameSave}
                  >
                    {nameSuccess ? (
                      <>
                        <Check size={15} /> Lagret!{" "}
                      </>
                    ) : (
                      "Lagre"
                    )}
                  </button>
                  <button
                    className="settings-cancel-btn"
                    onClick={cancelSection}
                  >
                    <X size={15} /> Avbryt
                  </button>
                </div>
              </div>
            )}

            <div className="settings-divider" />
            <div className="settings-row">
              <div className="settings-row-left">
                <div className="settings-row-icon">
                  <Lock size={18} />
                </div>
                <div>
                  <div className="settings-row-label">Passord</div>
                  <div className="settings-row-value">••••••••</div>
                </div>
              </div>
              {activeSection !== "password" && (
                <button
                  className="settings-edit-btn"
                  onClick={() => setActiveSection("password")}
                >
                  Endre
                </button>
              )}
            </div>

            {activeSection === "password" && (
              <div className="settings-edit-section">
                <div className="settings-password-field">
                  <input
                    className="settings-input"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nåværende passord"
                    autoFocus
                  />
                  <button
                    className="settings-eye-btn"
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="settings-password-field">
                  <input
                    className="settings-input"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nytt passord (min. 8 tegn)"
                  />

                  <button
                    className="settings-eye-btn"
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="settings-password-field">
                  <input
                    className="settings-input"
                    type={showRepeat ? "text" : "password"}
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    placeholder="Gjenta passord"
                  />

                  <button
                    className="settings-eye-btn"
                    type="button"
                    onClick={() => setShowRepeat(!showRepeat)}
                  >
                    {showRepeat ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="settings-error">{passwordError}</p>
                )}
                <div className="settings-edit-actions">
                  <button
                    className="settings-save-btn"
                    onClick={handlePasswordSave}
                  >
                    {passwordSuccess ? (
                      <>
                        <Check size={15} /> Lagret!
                      </>
                    ) : (
                      "Lagre"
                    )}
                  </button>
                  <button
                    className="settings-cancel-btn"
                    onClick={cancelSection}
                  >
                    <X size={15} /> Avbryt
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
