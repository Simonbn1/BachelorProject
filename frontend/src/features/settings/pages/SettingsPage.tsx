import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Camera, Check, Eye, EyeOff, Lock, User, X } from "lucide-react";
import "../styles/SettingsPage.css";

type UserProfile = {
  id: number;
  displayName: string;
  email: string;
  role: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Noe gikk galt.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storedUser = JSON.parse(localStorage.getItem("authUser") ?? "{}");
  const initialName = storedUser.displayName ?? storedUser.name ?? "Bruker";

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<
    "name" | "password" | null
  >(null);

  const [name, setName] = useState<string>(initialName);
  const [nameInput, setNameInput] = useState<string>(initialName);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);

  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await apiRequest<UserProfile>("/api/users/me");

        setName(profile.displayName);
        setNameInput(profile.displayName);

        localStorage.setItem(
          "authUser",
          JSON.stringify({
            ...storedUser,
            id: profile.id,
            displayName: profile.displayName,
            name: profile.displayName,
            email: profile.email,
            role: profile.role,
          }),
        );
      } catch (err) {
        console.error(err);
      }
    }

    loadProfile();
  }, []);

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUrl(URL.createObjectURL(file));
  }

  async function handleNameSave() {
    const trimmedName = nameInput.trim();

    if (!trimmedName) {
      setNameError("Navn kan ikke være tomt.");
      return;
    }

    try {
      setNameError(null);

      const profile = await apiRequest<UserProfile>("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ displayName: trimmedName }),
      });

      setName(profile.displayName);
      setNameInput(profile.displayName);

      const currentUser = JSON.parse(localStorage.getItem("authUser") ?? "{}");

      localStorage.setItem(
        "authUser",
        JSON.stringify({
          ...currentUser,
          id: profile.id,
          displayName: profile.displayName,
          name: profile.displayName,
          email: profile.email,
          role: profile.role,
        }),
      );

      setNameSuccess(true);

      setTimeout(() => {
        setNameSuccess(false);
        setActiveSection(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setNameError("Kunne ikke oppdatere navn.");
    }
  }

  async function handlePasswordSave() {
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

    try {
      await apiRequest<void>("/api/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");

      setTimeout(() => {
        setPasswordSuccess(false);
        setActiveSection(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setPasswordError("Kunne ikke oppdatere passord.");
    }
  }

  function cancelSection() {
    setActiveSection(null);
    setNameInput(name);
    setCurrentPassword("");
    setNewPassword("");
    setRepeatPassword("");
    setNameError(null);
    setPasswordError(null);
  }

  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="page settings-page">
      <div className="page-intro">
        <button
          type="button"
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
                  type="button"
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

                {nameError && <p className="settings-error">{nameError}</p>}

                <div className="settings-edit-actions">
                  <button
                    type="button"
                    className="settings-save-btn"
                    onClick={handleNameSave}
                  >
                    {nameSuccess ? (
                      <>
                        <Check size={15} /> Lagret!
                      </>
                    ) : (
                      "Lagre"
                    )}
                  </button>

                  <button
                    type="button"
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
                  type="button"
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
                    type="button"
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
                    type="button"
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
