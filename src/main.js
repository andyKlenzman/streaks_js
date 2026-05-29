// ABOUTME: App entry point — mounts the auth gate and launches the active view
// ABOUTME: Switch views by changing the key passed to mountView

import { mountLoginGate } from "./controller/auth";
import { mountView } from "./views/registry";
import "./style-weekly.css";

const root = document.body;
mountLoginGate({
  root,
  onReady: (user) => mountView("weekly", user),
});
