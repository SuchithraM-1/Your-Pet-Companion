import { db, auth } from "./firebase_setup.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  const container = document.getElementById("notifContainer");
  container.innerHTML = "Loading...";

  const notifRef = collection(db, `users/${user.uid}/notifications`);
  const snap = await getDocs(notifRef);

  if (snap.empty) {
    container.innerHTML = "<p>No notifications</p>";
    return;
  }

  container.innerHTML = "";
  snap.forEach(docSnap => {
    const n = docSnap.data();

    container.innerHTML += `
      <div class="notif-card">
        <div class="notif-icon">${n.icon || "🔔"}</div>
        <div>
          <h4>${n.title}</h4>
          <p>${n.message}</p>
        </div>
      </div>
    `;
  });
});
