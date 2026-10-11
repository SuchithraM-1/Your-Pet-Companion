import { auth, db } from "./firebase_setup.js";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

import {
  updateEmail,
  updatePassword,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login_page.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);

  let userData = {};
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    userData = snap.data();
  }

  const nameInput = document.getElementById("userNameInput");
  const emailInput = document.getElementById("userEmailInput");
  const profileSummary = document.getElementById("profileSummary");

  const langSelect = document.getElementById("languageSelect");
  const languageSummary = document.getElementById("languageSummary");

  // Prefill values
  const currentName = userData.name || "";
  const currentEmail = user.email || "";
  const currentLang = userData.language || "en";

  nameInput.value = currentName;
  emailInput.value = currentEmail;
  langSelect.value = currentLang;

  profileSummary.textContent = `Name: ${currentName || "—"} , Email: ${
    currentEmail || "—"
  }`;
  languageSummary.textContent =
    "Current: " + getLanguageLabel(currentLang);

  // --- Profile edit toggle ---
  const profileForm = document.getElementById("profileForm");
  document.getElementById("editProfileBtn").onclick = () => {
    profileForm.hidden = false;
  };
  document.getElementById("cancelProfileBtn").onclick = () => {
    profileForm.hidden = true;
    nameInput.value = currentName;
    emailInput.value = currentEmail;
  };

  document.getElementById("saveProfileBtn").onclick = async () => {
    const newName = nameInput.value.trim();
    const newEmail = emailInput.value.trim();

    if (!newName || !newEmail) {
      alert("Name and Email cannot be empty.");
      return;
    }

    try {
      await setDoc(
        userRef,
        {
          name: newName,
          email: newEmail,
        },
        { merge: true }
      );

      if (newEmail !== user.email) {
        await updateEmail(user, newEmail);
      }

      profileSummary.textContent = `Name: ${newName} , Email: ${newEmail}`;
      alert("Profile updated successfully!");
      profileForm.hidden = true;
    } catch (err) {
      console.error(err);
      alert("Could not update profile. Try logging in again.");
    }
  };

  // --- Password toggle ---
  const passForm = document.getElementById("passwordForm");
  document.getElementById("showPassFormBtn").onclick = () => {
    passForm.hidden = false;
  };
  document.getElementById("cancelPassBtn").onclick = () => {
    passForm.hidden = true;
    document.getElementById("passwordInput").value = "";
  };

  document.getElementById("changePassBtn").onclick = async () => {
    const newPass = document.getElementById("passwordInput").value;

    if (!newPass || newPass.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      await updatePassword(user, newPass);
      alert("Password updated.");
      passForm.hidden = true;
      document.getElementById("passwordInput").value = "";
    } catch (err) {
      console.error(err);
      alert("Password update failed. Login again and try.");
    }
  };

  // --- Language toggle ---
  const langForm = document.getElementById("languageForm");
  document.getElementById("showLangFormBtn").onclick = () => {
    langForm.hidden = false;
  };
  document.getElementById("cancelLangBtn").onclick = () => {
    langForm.hidden = true;
    langSelect.value = currentLang;
  };

  document.getElementById("saveLangBtn").onclick = async () => {
    const lang = langSelect.value;
    try {
      await setDoc(
        userRef,
        { language: lang },
        { merge: true }
      );
      languageSummary.textContent = "Current: " + getLanguageLabel(lang);
      alert("Language saved!");
      langForm.hidden = true;
    } catch (err) {
      console.error(err);
      alert("Could not save language.");
    }
  };

  // --- Delete account ---
  document.getElementById("deleteAccountBtn").onclick = async () => {
    if (!confirm("Are you sure you want to delete your account?")) return;

    try {
      await user.delete();
      alert("Account deleted.");
      window.location.href = "login_page.html";
    } catch (err) {
      console.error(err);
      alert("Could not delete account. Login again and retry.");
    }
  };
});

function getLanguageLabel(code) {
  if (code === "hi") return "Hindi";
  if (code === "kn") return "Kannada";
  return "English";
}
