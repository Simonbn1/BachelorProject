import { Outlet } from "react-router-dom";
import TopBar from "../shared/components/TopBar";

export default function AppLayout() {
  return (
    <div className="app-page">
      <div className="app-shell">
        <TopBar />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
