import "../features/timesheets/styles/TimesheetPage.css";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { devAutoLogin } from "../features/auth/api/authApi.ts";
import { router } from "./routes.tsx";

function App() {
  useEffect(() => {
    devAutoLogin();
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
