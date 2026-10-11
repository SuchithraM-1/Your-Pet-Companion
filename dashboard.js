// dashboard.js – robust version that works with different pet data formats
import { auth, db } from "./firebase_setup.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

/* ------------------------------------------------
   DOM ELEMENTS
---------------------------------------------------*/
const petNameEl = document.getElementById("petName");
const petMetaEl = document.getElementById("petMeta");
const petAvatarEl = document.querySelector(".pet-avatar");

const notificationBtn = document.getElementById("notificationBtn");
const settingsBtn = document.getElementById("settingsBtn");
const logoutBtn = document.getElementById("logoutBtn");

const petMenuBtn = document.getElementById("petMenuBtn");
const petDropdown = document.getElementById("petDropdown");

/* ------------------------------------------------
   STATE
---------------------------------------------------*/
let currentUser = null;
let petsList = []; // [{ type, name, breed, weight, ... }]
let activePetType = null;

/* ------------------------------------------------
   NAV / BUTTON HANDLERS
---------------------------------------------------*/
if (notificationBtn) {
  notificationBtn.addEventListener("click", () => {
    window.location.href = "notifications.html";
  });
}

if (settingsBtn) {
  settingsBtn.addEventListener("click", () => {
    window.location.href = "settings.html";
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "login_page.html";
    } catch (err) {
      console.error("Logout error:", err);
      alert("Logout failed. Try again.");
    }
  });
}

// Dropdown open/close
let dropdownOpen = false;

if (petMenuBtn && petDropdown) {
  petMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownOpen = !dropdownOpen;
    petDropdown.classList.toggle("active", dropdownOpen);
  });

  document.addEventListener("click", () => {
    dropdownOpen = false;
    petDropdown.classList.remove("active");
  });
}

/* ------------------------------------------------
   AUTH & INITIAL LOAD
---------------------------------------------------*/
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login_page.html";
    return;
  }

  currentUser = user.uid;
  await loadDashboardData();
});

/* ------------------------------------------------
   LOAD DASHBOARD DATA (ROBUST)
---------------------------------------------------*/
async function loadDashboardData() {
  try {
    // 1) Try users/{uid}
    const userRef = doc(db, "users", currentUser);
    const userSnap = await getDoc(userRef);

    let userData = {};
    if (userSnap.exists()) {
      userData = userSnap.data();
    }

    // 2) Normalize pets from users/{uid}.pets
    petsList = normalizePets(userData.pets);

    // 3) If still empty, try petDetails/{uid}
    if (petsList.length === 0) {
      const detailsRef = doc(db, "petDetails", currentUser);
      const detailsSnap = await getDoc(detailsRef);
      if (detailsSnap.exists()) {
        const d = detailsSnap.data();
        petsList = normalizePetsFromDetails(d);
      }
    }

    // 4) If STILL empty, just show "no pet"
    if (petsList.length === 0) {
      renderNoPet();
      renderPetDropdown([]);
      return;
    }

    // Determine active pet type
    activePetType =
      userData.lastPetType ||
      userData.lastPet || // older field name if you had it
      petsList[0]?.type ||
      "dog";

    renderPetDropdown(petsList);
    renderActivePet();

    // Save lastPetType back to user doc (for future loads)
    try {
      await updateDoc(userRef, { lastPetType: activePetType });
    } catch (e) {
      // ignore if doc doesn't exist / no permission
      console.warn("Could not update lastPetType:", e);
    }
  } catch (err) {
    console.error("Error loading dashboard:", err);
    renderError();
  }
}

/* ------------------------------------------------
   NORMALIZATION HELPERS
---------------------------------------------------*/
function normalizePets(petsField) {
  const list = [];

  if (!petsField) return list;

  // Case 1: already an array
  if (Array.isArray(petsField)) {
    petsField.forEach((p) => {
      if (!p) return;
      list.push({
        type: p.type || "pet",
        name: p.name || "",
        breed: p.breed || "",
        weight: p.weight || "",
        ...p,
      });
    });
    return list;
  }

  // Case 2: object style: { dog: {...}, cat: {...} }
  if (typeof petsField === "object") {
    Object.entries(petsField).forEach(([key, val]) => {
      if (!val) return;
      list.push({
        type: val.type || key,
        name: val.name || "",
        breed: val.breed || "",
        weight: val.weight || "",
        ...val,
      });
    });
    return list;
  }

  return list;
}

function normalizePetsFromDetails(detailsData) {
  const list = [];
  if (!detailsData || typeof detailsData !== "object") return list;

  if (detailsData.dog) {
    const d = detailsData.dog;
    list.push({
      type: "dog",
      name: d.name || "",
      breed: d.breed || "",
      weight: d.weight || "",
      ...d,
    });
  }

  if (detailsData.cat) {
    const c = detailsData.cat;
    list.push({
      type: "cat",
      name: c.name || "",
      breed: c.breed || "",
      weight: c.weight || "",
      ...c,
    });
  }

  return list;
}

/* ------------------------------------------------
   RENDER FUNCTIONS
---------------------------------------------------*/
function renderNoPet() {
  if (petNameEl) petNameEl.textContent = "No Pet Added";
  if (petMetaEl) petMetaEl.textContent = "Add your pet details to continue.";
  if (petAvatarEl) petAvatarEl.textContent = "🐾";
}

function renderError() {
  if (petNameEl) petNameEl.textContent = "Error loading pet";
  if (petMetaEl)
    petMetaEl.textContent = "Please check your internet or try again later.";
  if (petAvatarEl) petAvatarEl.textContent = "⚠️";
}

function renderActivePet() {
  const pet =
    petsList.find((p) => p.type === activePetType) || petsList[0] || null;

  if (!pet) {
    renderNoPet();
    return;
  }

  if (petNameEl) petNameEl.textContent = pet.name || "Unnamed Pet";

  const parts = [];
  if (pet.type) parts.push(capitalize(pet.type));
  if (pet.breed) parts.push(pet.breed);
  if (pet.weight) parts.push(`${pet.weight} kg`);

  if (petMetaEl)
    petMetaEl.textContent =
      parts.length > 0 ? parts.join(" • ") : "Pet details not complete.";

  if (petAvatarEl) {
    if (pet.type === "dog") petAvatarEl.textContent = "🐶";
    else if (pet.type === "cat") petAvatarEl.textContent = "🐱";
    else petAvatarEl.textContent = "🐾";
  }
}

function renderPetDropdown(list) {
  if (!petDropdown) return;

  petDropdown.innerHTML = "";

  if (!list || list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "dropdown-item";
    empty.textContent = "No pets yet";
    petDropdown.appendChild(empty);

    const add = document.createElement("p");
    add.className = "dropdown-item dropdown-add";
    add.textContent = "➕ Add Pet Details";
    add.onclick = () => (window.location.href = "pet_details.html");
    petDropdown.appendChild(add);
    return;
  }

  // Pet list
  list.forEach((p) => {
    const item = document.createElement("p");
    item.className = "dropdown-item";
    const icon = p.type === "cat" ? "🐱" : "🐶";
    const label = p.name || capitalize(p.type || "Pet");
    item.textContent = `${icon} ${label}`;
    item.onclick = () => handlePetSwitch(p.type);
    petDropdown.appendChild(item);
  });

  // Separator
  const hr = document.createElement("hr");
  hr.style.margin = "6px 0";
  hr.style.border = "none";
  hr.style.borderTop = "1px solid #eee";
  petDropdown.appendChild(hr);

  // Add / Edit option
  const add = document.createElement("p");
  add.className = "dropdown-item dropdown-add";
  add.textContent = "➕ Add / Edit Pet";
  add.onclick = () => (window.location.href = "pet_details.html");
  petDropdown.appendChild(add);
}

/* ------------------------------------------------
   SWITCH PET
---------------------------------------------------*/
async function handlePetSwitch(type) {
  activePetType = type;
  renderActivePet();

  // Save preference
  try {
    const userRef = doc(db, "users", currentUser);
    await updateDoc(userRef, { lastPetType: type });
  } catch (err) {
    console.warn("Could not update lastPetType:", err);
  }

  // Close dropdown
  dropdownOpen = false;
  petDropdown.classList.remove("active");
}

/* ------------------------------------------------
   SMALL UTILS
---------------------------------------------------*/
function capitalize(str = "") {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ------------------------------------------------
   OPTIONAL: REVEAL / AI HANDLING (SAFE NO-OP IF MISSING)
---------------------------------------------------*/
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  revealEls.forEach((el) => obs.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

// AI widget toggle (only if present)
const aiBtn = document.getElementById("aiBtn");
const aiChatWindow = document.getElementById("aiChatWindow");
const aiClose = document.getElementById("aiClose");

if (aiBtn && aiChatWindow && aiClose) {
  aiBtn.addEventListener("click", () => {
    aiChatWindow.style.bottom = "90px";
  });
  aiClose.addEventListener("click", () => {
    aiChatWindow.style.bottom = "-520px";
  });
}
