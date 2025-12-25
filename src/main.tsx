import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FrontierSDK } from "@frontiertower/frontier-sdk";
import {
  isInFrontierApp,
  renderStandaloneMessage,
} from "@frontiertower/frontier-sdk/ui-utils";
import App from "./App";
import "./index.css";

export const sdk = new FrontierSDK();

const rootElement = document.getElementById("root")!;

if (!isInFrontierApp()) {
  renderStandaloneMessage(rootElement, "Sponsor Pass Manager");
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
