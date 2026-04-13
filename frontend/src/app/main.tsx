import React from "react";
import ReactDOM from "react-dom/client";
import "./../shared/styles/globals.css";
import Providers from "./providers";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers />
  </React.StrictMode>,
);
