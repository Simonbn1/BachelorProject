import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { ToastProvider } from "../shared/components/ToastProvider.tsx";
import "../shared/styles/Toast.css";
import { createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({
  primaryColor: "violet",
});

export default function Providers() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </MantineProvider>
  );
}
