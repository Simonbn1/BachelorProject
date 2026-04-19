import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../api/authApi.ts";
import { saveAuth } from "../types/auth.ts";
import { validateLogin } from "../utils/validateLogin.ts";
import { useToasts } from "../../../shared/hooks/useToasts.ts";

export function useLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showToast } = useToasts();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateLogin(email, password);
    if (error) {
      alert(error);
      return;
    }

    try {
      const res = await login(email, password);
      saveAuth(res);

      if (res.user.roles.includes("ADMIN")) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Login failed");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
  };
}
