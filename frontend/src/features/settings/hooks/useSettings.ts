import React from "react";
import { useEffect, useRef, useState } from "react";
import { useToasts } from "../../../shared/hooks/useToasts.ts";
import { getAccessToken } from "../../auth/hooks/useAuth.ts";

export function useSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);

  const { showToast } = useToasts();

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      showToast("warning", "The avatar has not been changed");
      return;
    }
    setPendingAvatarUrl(URL.createObjectURL(file));
  }

  async function handleNameSave() {
    const nameError = validateName(nameInput);
    if (nameError) {
      showToast("warning", nameError);
      return;
    }

    if (nameInput.trim() === name) {
      showToast("warning", "Navnet er det samme som det nåværende");
      return;
    }

    try {
      await fetch(`/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({ displayName: nameInput.trim() }),
      });
      setName(nameInput.trim());
      setNameInput(nameInput.trim());
      setActiveSection(null);

      const storedUser = JSON.parse(localStorage.getItem("authUser") ?? "{}");
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          ...storedUser,
          displayName: nameInput.trim(),
        }),
      );
      window.dispatchEvent(new Event("storageChange", {}));

      showToast("success", "Navn oppdatert!");
    } catch {
      showToast("error", "Kunne ikke oppdatere navn.");
    }
    setName(nameInput.trim());
  }

  async function handlePasswordSave() {
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Skriv inn nåværende passord.");
      return;
    }

    if (newPassword !== repeatPassword) {
      setPasswordError("Passordene stemmer ikke overens");
      return;
    }

    const pwError = validateNewPassword(newPassword);
    if (pwError) {
      setPasswordError(pwError);
      return;
    }

    try {
      const res = await fetch(`/api/users/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        setPasswordError("Feil ved nåværende passord.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
      setActiveSection(null);
      showToast("success", "Passord oppdatert!");
    } catch {
      showToast("error", "Kunne ikke oppdatere passord.");
    }
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

  async function handleSave() {
    if (pendingAvatarUrl) {
      setAvatarUrl(pendingAvatarUrl);
      setPendingAvatarUrl(null);
      showToast("success", "Profilbilde oppdatert!");
    }
    if (activeSection === "name") await handleNameSave();
    else if (activeSection === "password") await handlePasswordSave();
  }

  function validateName(name: string): string | null {
    const parts = name.trim().split(/\s+/);
    if (parts.length < 2)
      return "Vennligst oppgi fullt navn (fornavn og etternavn).";
    if (name.trim().length > 100)
      return "Navn kan ikke være lengre enn 100 tegn.";
    if (!/^[a-zA-ZæøåÆØÅ -]+$/.test(name.trim()))
      return "Navn kan kun inneholde bokstaver, mellomrom og bindestrek.";
    return null;
  }

  function validateNewPassword(password: string): string | null {
    if (password.length < 8) return "Passordet må minst være 8 tegn";
    if (!/[a-zA-ZæøåÆØÅ]/.test(password))
      return "Passordet må inneholde minst en bokstav";
    if (!/\d/.test(password)) return "Passordet må inneholde minst ett tall.";
    return null;
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = getAccessToken();
        if (!token) return;

        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        });
        const profile = await res.json();
        setName(profile.displayName);
        setNameInput(profile.displayName);
      } catch (err) {
        console.error(err);
      }
    }
    void loadProfile();
  }, []);

  return {
    fileInputRef,
    avatarUrl,
    pendingAvatarUrl,
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
    handleAvatarChange,
    cancelSection,
    handleSave,
  };
}
