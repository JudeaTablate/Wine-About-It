import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);

console.log(
  "%c🍷 Wine About It%c\nCurious how it works? Press / for the command palette, then toggle Developer mode in the footer to see live chat telemetry.\nSource: https://github.com/JudeaTablate/Wine-About-It",
  "font:700 20px Georgia;color:#7a2f45", "font:13px system-ui;color:#555"
);
