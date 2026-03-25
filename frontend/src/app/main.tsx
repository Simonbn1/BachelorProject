import React from "react";
import ReactDOM from "react-dom/client";
import "./../shared/styles/globals.css";
import Providers from "./providers";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
const theme = createTheme({
  primaryColor: "violet",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Providers />
    </MantineProvider>
  </React.StrictMode>,
);
