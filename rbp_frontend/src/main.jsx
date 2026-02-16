import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ChatBotWrapper from "./components/ChatBotWrapper"
import App from "./App";
import "./index.css";



ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App /><ChatBotWrapper />
    </AuthProvider>
  </BrowserRouter>
);
