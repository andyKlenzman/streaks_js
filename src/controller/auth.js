// ABOUTME: Firebase auth gate — renders login/signup form and calls onReady on success
// ABOUTME: Handles signIn and createUser, toggling between the two modes in-place

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth } from "../../firebase-config";

export function mountLoginGate({ root, onReady }) {
  let mode = "login"; // "login" | "signup"

  const wrapper = document.createElement("div");
  wrapper.id = "login-gate";

  const render = () => {
    const isLogin = mode === "login";
    wrapper.innerHTML = `
      <div class="login-container">
        <h2 class="login-title">Streaks</h2>
        <p class="login-subtitle">${isLogin ? "Welcome back" : "Create an account"}</p>
        ${!isLogin ? `<input id="username" type="text" placeholder="Username" class="login-input" autocomplete="username">` : ''}
        <input id="email" type="email" placeholder="Email" class="login-input" autocomplete="email">
        <input id="password" type="password" placeholder="Password" class="login-input" autocomplete="${isLogin ? "current-password" : "new-password"}">
        <button id="submit-btn" class="login-button">${isLogin ? "Sign in" : "Sign up"}</button>
        <p id="err" class="login-error"></p>
        <p class="login-toggle">
          ${isLogin ? "No account yet?" : "Already have an account?"}
          <button id="toggle-btn" class="login-toggle-btn">${isLogin ? "Sign up" : "Sign in"}</button>
        </p>
      </div>
    `;

    const $ = (id) => wrapper.querySelector(`#${id}`);

    $("toggle-btn").addEventListener("click", () => {
      mode = isLogin ? "signup" : "login";
      render();
    });

    $("submit-btn").addEventListener("click", async () => {
      $("err").textContent = "";
      const email = $("email").value.trim();
      const pw = $("password").value;
      try {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, pw);
        } else {
          const username = $("username")?.value.trim() || "";
          const cred = await createUserWithEmailAndPassword(auth, email, pw);
          if (username) await updateProfile(cred.user, { displayName: username });
        }
      } catch (e) {
        $("err").textContent = e.message || "Something went wrong";
      }
    });

    // Allow Enter key to submit
    wrapper.querySelectorAll(".login-input").forEach((input) => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") $("submit-btn").click();
      });
    });
  };

  render();
  root.appendChild(wrapper);

  const unsub = onAuthStateChanged(auth, (user) => {
    if (user) {
      wrapper.remove();
      unsub();
      onReady(user);
    }
  });

  return { logout: () => signOut(auth) };
}
