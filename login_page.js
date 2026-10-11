import { auth, googleProvider } from "./firebase_setup.js";
import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

const $ = (s) => document.querySelector(s);

// ----------------------------
// CLEAR INPUTS ON PAGE LOAD
// ----------------------------
window.addEventListener("load", () => {
  ["loginEmail", "loginPassword", "signupEmail", "signupPassword", "confirmPassword", "displayName"]
    .forEach(id => {
      const field = document.getElementById(id);
      if (field) field.value = "";
    });

  // Chrome autofill prevention
  setTimeout(() => {
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
  }, 50);
});

// ----------------------------
// ALSO CLEAR WHEN SWITCHING FORMS
// ----------------------------
function clearLoginFields() {
  $("#loginEmail").value = "";
  $("#loginPassword").value = "";
  $("#rememberMe").checked = false;
}

function clearSignupFields() {
  $("#displayName").value = "";
  $("#signupEmail").value = "";
  $("#signupPassword").value = "";
  $("#confirmPassword").value = "";
}

// ----------------------------
// LOGIN FORM
// ----------------------------
$("#loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = $("#loginEmail").value.trim();
  const password = $("#loginPassword").value;
  const remember = $("#rememberMe").checked;

  try {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, password);

    clearLoginFields();
    window.location.href = "pet_selection.html";
  } catch (e) {
    alert(e.message);
  }
});

// ----------------------------
// SIGNUP FORM
// ----------------------------
$("#signupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = $("#displayName").value.trim();
  const email = $("#signupEmail").value.trim();
  const pass = $("#signupPassword").value;
  const confirm = $("#confirmPassword").value;

  if (pass !== confirm) return alert("Passwords do not match!");

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCred.user, { displayName: name });

    clearSignupFields();
    window.location.href = "pet_selection.html";
  } catch (err) {
    alert(err.message);
  }
});

// ----------------------------
// GOOGLE LOGIN
// ----------------------------
$("#googleBtn")?.addEventListener("click", async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithPopup(auth, googleProvider);

    window.location.href = "pet_selection.html";
  } catch (err) {
    alert(err.message);
  }
});

// ----------------------------
// FORGOT PASSWORD
// ----------------------------
$("#forgotBtn")?.addEventListener("click", async () => {
  const email = prompt("Enter your email:");
  if (!email) return;

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent.");
  } catch (e) {
    alert(e.message);
  }
});

// ----------------------------
// SWITCH FORMS (ALSO CLEAR FIELDS)
// ----------------------------
$("#showSignup")?.addEventListener("click", (e) => {
  e.preventDefault();

  clearLoginFields();

  $("#loginForm").classList.remove("active");
  $("#signupForm").classList.add("active");
});

$("#showLogin")?.addEventListener("click", (e) => {
  e.preventDefault();

  clearSignupFields();

  $("#signupForm").classList.remove("active");
  $("#loginForm").classList.add("active");
});
