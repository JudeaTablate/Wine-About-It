import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@fontsource-variable/dm-sans/index.css";
import "@fontsource-variable/dm-sans/wght-italic.css";
import "@fontsource-variable/playfair-display/index.css";
import "@fontsource-variable/playfair-display/wght-italic.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/atkinson-hyperlegible-next/400.css";
import "@fontsource/atkinson-hyperlegible-next/700.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);

console.log(
  "%cWine About It%c\nCurious how it works? Press / to search, then turn on Developer mode in the footer to see live chat telemetry.\nSource: https://github.com/JudeaTablate/Wine-About-It",
  "font:700 20px Georgia;color:#7a2f45", "font:13px system-ui;color:#555"
);
