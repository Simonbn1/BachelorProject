import { useNavigate } from "react-router-dom";
import { Camera, Eye, EyeOff, Lock, User, X } from "lucide-react";
import "../styles/SettingsPage.css";
import { useSettings } from "../hooks/useSettings.ts";
import "../../../shared/styles/globals.css";

export default function SettingsPage() {
  const navigate = useNavigate();
  const {
    activeSection,
    setActiveSection,
    name,
    nameInput,
    setNameInput,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    repeatPassword,
    setRepeatPassword,
    showCurrent,
    setShowCurrent,
    showNew,
    setShowNew,
    showRepeat,
    setShowRepeat,
    passwordError,
    initials,
    cancelSection,
    handleSave,
  } = useSettings();

  return (
    <div className="page settings-page">
      <div className="page-intro">
        <button
          className="page-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Oversikt
        </button>
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
              <div className="settings-avatar-placeholder">{initials}</div>
              <div className="settings-avatar-overlay">
                <Camera size={20} />
              </div>
              <div className="settings-avatar-info">
                <span className="settings-avatar-name">{name}</span>
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
                    console.log("Setting activeSection to name");
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
              </div>
            )}
            {passwordError && <p className="settings-error">{passwordError}</p>}

            <div className="settings-footer-actions">
              <button className="settings-save-btn" onClick={handleSave}>
                Lagre
              </button>
              <button className="settings-cancel-btn" onClick={cancelSection}>
                <X size={15} /> Avbryt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
