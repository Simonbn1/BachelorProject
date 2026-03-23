import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

export default function Providers() {
  return <RouterProvider router={router} />;
}
