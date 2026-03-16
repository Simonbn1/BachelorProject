const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");

  const data = await res.json();
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("userId", String(data.user.id));
}

export async function devAutoLogin(): Promise<void> {
  if (!import.meta.env.DEV) return;
  if (localStorage.getItem("accessToken")) return;
  await login("test@test.com", "password123");
}
