import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import "./../shared/styles/globals.css";
import Providers from "./providers";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <MantineProvider>
    <React.StrictMode>
      <Providers />
    </React.StrictMode>
  </MantineProvider>,
);
