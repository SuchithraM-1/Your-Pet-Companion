// admin_dashboard.js – CLEAN & WORKING VERSION

// We only need Firestore (db). Auth is not used here.
import { db } from "./firebase_setup.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---------------- ADMIN GUARD (localStorage) ----------------

// Admin logs in via admin_login.html → sets localStorage "adminLoggedIn" = "true"
document.addEventListener("DOMContentLoaded", () => {
  const isAdmin = localStorage.getItem("adminLoggedIn") === "true";
  if (!isAdmin) {
    // Not logged in as admin → go back to admin login page
    window.location.href = "admin_login.html";
    return;
  }

  initAdmin();
});

// ---------------- INIT ----------------

function initAdmin() {
  setupNav();
  setupTilesAndMenu();
  setupSectionButtons();

  // load initial data
  loadUsers();
  loadAllPets();
  loadSuggestions();
  loadBreeds();
  loadEmergencyContacts();
  loadAnnouncements();
}

// ---------------- NAVBAR (menu, logout) ----------------

function setupNav() {
  const menuBtn = document.getElementById("adminMenuBtn");
  const dropdown = document.getElementById("adminMenuDropdown");
  const logoutBtn = document.getElementById("adminLogoutBtn");
  const notifBtn = document.getElementById("adminNotifBtn");
  const settingsBtn = document.getElementById("adminSettingsBtn");

  // dropdown open/close
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.style.display =
      dropdown.style.display === "flex" ? "none" : "flex";
  });

  document.addEventListener("click", () => {
    dropdown.style.display = "none";
  });

  // dropdown section navigation
  dropdown.querySelectorAll("button[data-section]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sec = btn.getAttribute("data-section");
      showSection(sec);
    });
  });

  // logout → clear admin flag and go to admin login page
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "admin_login.html";
  });

  // optional pages
  notifBtn.addEventListener("click", () => {
    alert("Notifications page not implemented yet.");
  });

  settingsBtn.addEventListener("click", () => {
    alert("Settings page not implemented yet.");
  });
}

// ---------------- TILE CLICK HANDLING ----------------

function setupTilesAndMenu() {
  document.querySelectorAll(".tile[data-section]").forEach((tile) => {
    tile.addEventListener("click", () => {
      const sec = tile.getAttribute("data-section");
      showSection(sec);
    });
  });
}

function showSection(key) {
  document
    .querySelectorAll(".admin-section")
    .forEach((sec) => sec.classList.add("hidden"));

  const target = document.getElementById(`section-${key}`);
  if (target) {
    target.classList.remove("hidden");
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ---------------- SECTION BUTTONS ----------------

function setupSectionButtons() {
  // users
  document.getElementById("refreshUsersBtn").onclick = loadUsers;
  document.getElementById("exportUsersBtn").onclick = exportUsersCSV;
  document.getElementById("exportUsersBtn2").onclick = exportUsersCSV;

  // pets
  document.getElementById("refreshPetsBtn").onclick = loadAllPets;
  document.getElementById("exportPetsBtn").onclick = exportPetsCSV;
  document.getElementById("exportPetsBtn2").onclick = exportPetsCSV;

  // suggestions
  document.getElementById("refreshSuggestionsBtn").onclick = loadSuggestions;
  document.getElementById("exportSuggestionsBtn").onclick =
    exportSuggestionsCSV;

  // breeds
  document.getElementById("addBreedBtn").onclick = addBreed;

  // emergency contacts
  document.getElementById("addEmergencyBtn").onclick = addEmergency;

  // announcements
  document.getElementById("postAnnouncementBtn").onclick = postAnnouncement;
}

// ========================= USERS =========================

async function loadUsers() {
  const box = document.getElementById("usersList");
  box.innerHTML = "Loading users...";

  try {
    const snap = await getDocs(collection(db, "users"));

    if (snap.empty) {
      box.innerHTML = "<p>No users found.</p>";
      return;
    }

    box.innerHTML = "";
    snap.forEach((userDoc) => {
      const u = userDoc.data();
      const uid = userDoc.id;

      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        <strong>${u.name || "Unnamed user"}</strong><br>
        Email: ${u.email || "N/A"}<br>
        UID: ${uid}<br>
        <button class="btn-delete-user">Delete User</button>
      `;

      item.querySelector(".btn-delete-user").onclick = () => deleteUser(uid);
      box.appendChild(item);
    });
  } catch (err) {
    console.error("Error loading users:", err);
    box.innerHTML = `<p>Error loading users.</p>`;
  }
}

async function deleteUser(uid) {
  if (!confirm("Delete this user and all their pets?")) return;

  try {
    // delete pets subcollection
    const petsRef = collection(db, `users/${uid}/pets`);
    const petSnap = await getDocs(petsRef);
    for (const petDoc of petSnap.docs) {
      await deleteDoc(doc(db, `users/${uid}/pets/${petDoc.id}`));
    }

    // delete user doc
    await deleteDoc(doc(db, "users", uid));
    alert("User deleted.");
    loadUsers();
    loadAllPets();
  } catch (err) {
    console.error("Error deleting user:", err);
    alert("Failed to delete user. Check console.");
  }
}

// ========================= PETS =========================

async function loadAllPets() {
  const box = document.getElementById("petsList");
  box.innerHTML = "Loading pets...";

  try {
    const usersSnap = await getDocs(collection(db, "users"));
    box.innerHTML = "";

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const user = userDoc.data();
      const petsSnap = await getDocs(collection(db, `users/${uid}/pets`));

      petsSnap.forEach((petDoc) => {
        const pet = petDoc.data();
        const item = document.createElement("div");
        item.className = "list-item";
        item.innerHTML = `
          <strong>${pet.name || "Unnamed pet"}</strong> (${pet.type ||
          "N/A"})<br>
          Owner: ${user.name || "Unknown"} (${user.email || "N/A"})<br>
          Breed: ${pet.breed || "N/A"}<br>
          <button class="btn-delete-pet">Delete Pet</button>
        `;
        item.querySelector(".btn-delete-pet").onclick = () =>
          deletePet(uid, petDoc.id);
        box.appendChild(item);
      });
    }

    if (!box.innerHTML) {
      box.innerHTML = "<p>No pets found.</p>";
    }
  } catch (err) {
    console.error("Error loading pets:", err);
    box.innerHTML = `<p>Error loading pets.</p>`;
  }
}

async function deletePet(uid, petId) {
  if (!confirm("Delete this pet?")) return;

  try {
    await deleteDoc(doc(db, `users/${uid}/pets/${petId}`));
    alert("Pet deleted.");
    loadAllPets();
  } catch (err) {
    console.error("Error deleting pet:", err);
    alert("Failed to delete pet. Check console.");
  }
}

// ========================= SUGGESTIONS =========================

async function loadSuggestions() {
  const box = document.getElementById("suggestionList");
  box.innerHTML = "Loading suggestions...";

  try {
    const snap = await getDocs(collection(db, "suggestions"));
    if (snap.empty) {
      box.innerHTML = "<p>No suggestions yet.</p>";
      return;
    }

    box.innerHTML = "";
    snap.forEach((sDoc) => {
      const s = sDoc.data();
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        <strong>${s.name || "Anonymous"}</strong><br>
        ${s.message || ""}<br>
        <button class="btn-resolve">Mark Resolved</button>
      `;
      item.querySelector(".btn-resolve").onclick = async () => {
        await deleteDoc(doc(db, "suggestions", sDoc.id));
        loadSuggestions();
      };
      box.appendChild(item);
    });
  } catch (err) {
    console.error("Error loading suggestions:", err);
    box.innerHTML = `<p>Error loading suggestions.</p>`;
  }
}

// ========================= ANNOUNCEMENTS =========================

async function postAnnouncement() {
  const txt = document.getElementById("announcementText").value.trim();
  if (!txt) {
    alert("Enter announcement text.");
    return;
  }

  try {
    await addDoc(collection(db, "announcements"), {
      message: txt,
      createdAt: serverTimestamp(),
    });

    // also push as notifications for all users
    const usersSnap = await getDocs(collection(db, "users"));
    for (const userDoc of usersSnap.docs) {
      await addDoc(collection(db, `users/${userDoc.id}/notifications`), {
        title: "Announcement",
        message: txt,
        icon: "📢",
        createdAt: serverTimestamp(),
      });
    }

    alert("Announcement posted to all users.");
    document.getElementById("announcementText").value = "";
    loadAnnouncements();
  } catch (err) {
    console.error("Error posting announcement:", err);
    alert("Failed to post announcement.");
  }
}

async function loadAnnouncements() {
  const box = document.getElementById("annList");
  if (!box) return;
  box.innerHTML = "Loading announcements...";

  try {
    const snap = await getDocs(collection(db, "announcements"));
    if (snap.empty) {
      box.innerHTML = "<p>No announcements yet.</p>";
      return;
    }

    box.innerHTML = "";
    snap.forEach((aDoc) => {
      const a = aDoc.data();
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `${a.message || ""}<br>`;
      box.appendChild(item);
    });
  } catch (err) {
    console.error("Error loading announcements:", err);
    box.innerHTML = "<p>Error loading announcements.</p>";
  }
}

// ========================= EMERGENCY CONTACTS =========================

async function addEmergency() {
  const nameEl = document.getElementById("emName");
  const phoneEl = document.getElementById("emPhone");
  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();

  if (!name || !phone) {
    alert("Enter both name and phone.");
    return;
  }

  try {
    await addDoc(collection(db, "emergencyContacts"), { name, phone });
    nameEl.value = "";
    phoneEl.value = "";
    loadEmergencyContacts();
  } catch (err) {
    console.error("Error adding emergency contact:", err);
    alert("Failed to add contact.");
  }
}

async function loadEmergencyContacts() {
  const box = document.getElementById("emList");
  box.innerHTML = "Loading contacts...";

  try {
    const snap = await getDocs(collection(db, "emergencyContacts"));
    if (snap.empty) {
      box.innerHTML = "<p>No emergency contacts yet.</p>";
      return;
    }

    box.innerHTML = "";
    snap.forEach((cDoc) => {
      const c = cDoc.data();
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        ${c.name || ""} - ${c.phone || ""}<br>
        <button class="btn-del-em">Delete</button>
      `;
      item.querySelector(".btn-del-em").onclick = async () => {
        await deleteDoc(doc(db, "emergencyContacts", cDoc.id));
        loadEmergencyContacts();
      };
      box.appendChild(item);
    });
  } catch (err) {
    console.error("Error loading contacts:", err);
    box.innerHTML = "<p>Error loading emergency contacts.</p>";
  }
}

// ========================= BREEDS =========================

async function addBreed() {
  const nameEl = document.getElementById("breedNameInput");
  const typeEl = document.getElementById("breedTypeSelect");
  const name = nameEl.value.trim();
  const type = typeEl.value; // "dog" or "cat"

  if (!name) {
    alert("Enter breed name.");
    return;
  }

  try {
    await addDoc(collection(db, "breeds"), { name, type });
    nameEl.value = "";
    loadBreeds();
  } catch (err) {
    console.error("Error adding breed:", err);
    alert("Failed to add breed.");
  }
}

async function loadBreeds() {
  const box = document.getElementById("breedList");
  box.innerHTML = "Loading breeds...";

  try {
    const snap = await getDocs(collection(db, "breeds"));

    if (snap.empty) {
      box.innerHTML = "<p>No breeds added yet.</p>";
      return;
    }

    box.innerHTML = "";
    snap.forEach((bDoc) => {
      const b = bDoc.data();
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        ${b.type?.toUpperCase() || ""} - ${b.name || ""}<br>
        <button class="btn-del-breed">Remove</button>
      `;
      item.querySelector(".btn-del-breed").onclick = async () => {
        await deleteDoc(doc(db, "breeds", bDoc.id));
        loadBreeds();
      };
      box.appendChild(item);
    });
  } catch (err) {
    console.error("Error loading breeds:", err);
    box.innerHTML = "<p>Error loading breeds.</p>";
  }
}

// ========================= EXPORT HELPERS =========================

function downloadCSV(filename, rows) {
  if (!rows || !rows.length) {
    alert("No data to export.");
    return;
  }

  const csv = rows
    .map((row) =>
      row
        .map((val) => `"${(val ?? "").toString().replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---- Export Users ----
async function exportUsersCSV() {
  try {
    const snap = await getDocs(collection(db, "users"));
    const rows = [["UID", "Name", "Email"]];

    snap.forEach((d) => {
      const u = d.data();
      rows.push([d.id, u.name || "", u.email || ""]);
    });

    downloadCSV("users.csv", rows);
  } catch (err) {
    console.error("Error exporting users:", err);
    alert("Failed to export users.");
  }
}

// ---- Export Pets ----
async function exportPetsCSV() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const rows = [["OwnerUID", "OwnerName", "OwnerEmail", "PetName", "Type", "Breed"]];

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const u = userDoc.data();
      const petSnap = await getDocs(collection(db, `users/${uid}/pets`));
      petSnap.forEach((petDoc) => {
        const p = petDoc.data();
        rows.push([
          uid,
          u.name || "",
          u.email || "",
          p.name || "",
          p.type || "",
          p.breed || "",
        ]);
      });
    }

    downloadCSV("pets.csv", rows);
  } catch (err) {
    console.error("Error exporting pets:", err);
    alert("Failed to export pets.");
  }
}

// ---- Export Suggestions ----
async function exportSuggestionsCSV() {
  try {
    const snap = await getDocs(collection(db, "suggestions"));
    const rows = [["Name", "Message"]];

    snap.forEach((d) => {
      const s = d.data();
      rows.push([s.name || "", s.message || ""]);
    });

    downloadCSV("suggestions.csv", rows);
  } catch (err) {
    console.error("Error exporting suggestions:", err);
    alert("Failed to export suggestions.");
  }
}
