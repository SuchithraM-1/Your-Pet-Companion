import { auth, db } from "./firebase_setup.js";
import {
    doc,
    getDoc,
    updateDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

/* ------------------------------
    LOAD TRANSLATIONS JSON
------------------------------- */
let translations = {};

async function loadTranslationFile(lang) {
    const response = await fetch(`./translations/${lang}.json`);
    translations = await response.json();
}

/* ------------------------------
    APPLY TRANSLATIONS
------------------------------- */
export function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.dataset.i18n;
        if (translations[key]) {
            el.innerText = translations[key];
        }
    });
}

/* ------------------------------
    LOAD LANGUAGE FROM DATABASE
------------------------------- */
export async function loadLanguage() {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", user.uid, "settings", "preferences");
    let snap = await getDoc(ref);

    let lang = "en"; // default language

    if (!snap.exists()) {
        await setDoc(ref, { language: "en" });
    } else {
        lang = snap.data().language || "en";
    }

    document.getElementById("languageSelect").value = lang;

    await loadTranslationFile(lang);
    applyTranslations();
}

/* ------------------------------
    CHANGE LANGUAGE MANUALLY
------------------------------- */
export async function changeLanguage(lang) {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", user.uid, "settings", "preferences");
    await updateDoc(ref, { language: lang });

    await loadTranslationFile(lang);
    applyTranslations();
}
