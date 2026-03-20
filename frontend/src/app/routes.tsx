import { createBrowserRouter } from "react-router-dom";
import TimesheetPage from "../features/timesheets/pages/TimesheetPage.tsx";
import AbsencePage from "../features/absence/pages/AbsencePage.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <TimesheetPage />,
  },
  {
    path: "/absence",
    element: <AbsencePage />,
  },
]);
