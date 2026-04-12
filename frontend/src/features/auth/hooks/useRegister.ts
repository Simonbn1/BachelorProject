import { register } from "../api/authApi.ts";
import { saveAuth } from "../types/auth.ts";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function useRegister() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

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
      alert("Register failed");
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
  };
}
