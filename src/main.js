import { mountLoginGate } from "./controller/auth";
import renderApp from "./controller/controller";

const root = document.body;
mountLoginGate({
  root,
  onReady: (user) => renderApp(user),
});
