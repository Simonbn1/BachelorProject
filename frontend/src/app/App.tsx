import TimesheetPage from "../features/timesheets/pages/TimesheetPage";
import "../features/timesheets/styles/TimesheetPage.css";
import { useEffect } from "react";
import { devAutoLogin } from "../features/auth/api/authApi.ts";

function App() {
  useEffect(() => {
    devAutoLogin();
  }, []);

  return <TimesheetPage />;
}

export default App;
