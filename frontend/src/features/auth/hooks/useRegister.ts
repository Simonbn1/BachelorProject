import { register } from "../api/authApi.ts";
import { saveAuth } from "../types/auth.ts";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { validateRegister } from "../utils/validateRegister.ts";
import { useToasts } from "../../../shared/hooks/useToasts.ts";

export function useRegister() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);

  const { showToast } = useToasts();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = validateRegister(
      displayName,
      email,
      password,
      confirmPassword,
    );

    if (result) {
      setError(result.message);
      setErrorField(result.field);
      showToast("error", "Registrering feilet", result.message);
      return;
    }

    setError(null);
    setErrorField(null);

    try {
      const res = await register(displayName, email, password);
      saveAuth(res);

      if (res.user.roles.includes("ADMIN")) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/timesheet", { replace: true });
      }
    } catch (err) {
      console.error(err);
      showToast(
        "error",
        "Registrering feilet",
        "E-postadressen er ikke godkjent. Kun Accenture-kontoer har tilgang til systemet.",
      );
    }
  };

  return {
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
  };
}
