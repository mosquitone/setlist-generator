import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "semantic-ui-css/semantic.min.css";
import App from "./App";
import { SetlistManagerProvider } from "./client";

const root = ReactDOM.createRoot(document.querySelector("#root")!);
root.render(
  <BrowserRouter>
    <SetlistManagerProvider>
      <App />
    </SetlistManagerProvider>
  </BrowserRouter>,
);
