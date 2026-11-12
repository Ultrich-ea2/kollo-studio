import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./ui-fonts/fonts.css";
import "./style.css";
import "./studio.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
