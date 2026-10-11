import { auth, db, storage } from "./firebase_setup.js";
import {
  doc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Please login first");
    window.location.href = "login_page.html";
    return;
  }

  loadVaccinationHistory(user.uid);

  document.getElementById("saveVaccineBtn").onclick = () =>
    saveVaccineRecord(user.uid);
});

/* -----------------------------------------
   LOAD VACCINATION HISTORY
-------------------------------------------- */
async function loadVaccinationHistory(uid) {
  const historyBox = document.getElementById("vaccineHistory");
  historyBox.innerHTML = "<p>Loading...</p>";

  const recordsRef = collection(db, `users/${uid}/vaccinations`);
  const snap = await getDocs(recordsRef);

  if (snap.empty) {
    historyBox.innerHTML = "<p>No vaccination records yet.</p>";
    return;
  }

  historyBox.innerHTML = "";

  snap.forEach((docSnap) => {
    const d = docSnap.data();

    historyBox.innerHTML += `
      <div class="vaccine-card">
        <h3>${d.vaccineName}</h3>
        <p><strong>Vaccinated on:</strong> ${d.date}</p>
        <p><strong>Next Due:</strong> ${d.nextDate}</p>
        <a href="${d.proofUrl}" target="_blank">View Proof</a>
      </div>
    `;
  });
}

/* -----------------------------------------
   SAVE NEW VACCINATION RECORD
-------------------------------------------- */
async function saveVaccineRecord(uid) {
  const vaccineName = document.getElementById("vaccineSelect").value;
  const date = document.getElementById("vaccineDate").value;
  const proofFile = document.getElementById("proof").files[0];

  if (!vaccineName || !date || !proofFile) {
    alert("Please fill all fields");
    return;
  }

  // Calculate next due date (1 year later)
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + 1);

  const nextDue = next.toISOString().split("T")[0];

  // Upload proof
  const fileRef = ref(storage, `vaccinations/${uid}/${Date.now()}-${proofFile.name}`);
  await uploadBytes(fileRef, proofFile);
  const proofUrl = await getDownloadURL(fileRef);

  // Save to Firestore
  await addDoc(collection(db, `users/${uid}/vaccinations`), {
    vaccineName,
    date,
    nextDate: nextDue,
    proofUrl,
    createdAt: serverTimestamp()
  });

  // Add notification
  await addDoc(collection(db, `users/${uid}/notifications`), {
    title: "Upcoming Vaccination",
    message: `${vaccineName} is due on ${nextDue}`,
    icon: "💉",
    createdAt: serverTimestamp()
  });

  alert("Vaccination record saved!");
  loadVaccinationHistory(uid);
}
