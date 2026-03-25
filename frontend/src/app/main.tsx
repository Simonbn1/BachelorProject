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
  <MantineProvider theme={theme} defaultColorScheme="dark">
    <React.StrictMode>
      <Providers />
    </React.StrictMode>
  </MantineProvider>,
);
