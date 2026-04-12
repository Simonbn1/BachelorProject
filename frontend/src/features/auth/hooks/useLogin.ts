import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../api/authApi.ts";
import { saveAuth } from "../types/auth.ts";
import { validateLogin } from "../utils/validateLogin.ts";

export function useLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        navigate("/timesheet", { replace: true });
      }
    } catch (err) {
      console.error(err);
      alert("Login failed");
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
