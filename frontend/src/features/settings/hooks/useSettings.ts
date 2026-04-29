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
    if (!nameInput.trim()) {
      showToast("warning", "Type your full name to change it");
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
      setNameInput(nameInput.trim());
      setActiveSection(null);
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

    if (newPassword.length < 8) {
      setPasswordError("Nytt passord må være minst 8 tegn.");
      return;
    }

    if (newPassword !== repeatPassword) {
      setPasswordError("Passordene stemmer ikke overens.");
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

  useEffect(() => {
    async function loadProfile() {
      try {
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
