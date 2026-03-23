import "../features/timesheets/styles/TimesheetPage.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

function App(): React.JSX.Element {
    return <RouterProvider router={router} />;
}

export default App;