import { auth, db } from "./firebase_setup.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

let currentUser = null;

// WAIT FOR USER LOGIN
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Please login again.");
    window.location.href = "login_page.html";
    return;
  }

  currentUser = user.uid;
  loadPetDetails();
});

// LOAD EXISTING PET DETAILS
async function loadPetDetails() {
  const ref = doc(db, "users", currentUser);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  const pets = data.pets || {};

  // DOG
  if (pets.dog) {
    document.getElementById("dogName").value = pets.dog.name || "";
    document.getElementById("dogBreed").value = pets.dog.breed || "";
    document.getElementById("dogAge").value = pets.dog.age || "";
    document.getElementById("dogWeight").value = pets.dog.weight || "";
    document.getElementById("dogColor").value = pets.dog.color || "";
  }

  // CAT
  if (pets.cat) {
    document.getElementById("catName").value = pets.cat.name || "";
    document.getElementById("catBreed").value = pets.cat.breed || "";
    document.getElementById("catAge").value = pets.cat.age || "";
    document.getElementById("catWeight").value = pets.cat.weight || "";
    document.getElementById("catColor").value = pets.cat.color || "";
  }
}

// SAVE BUTTON
document.getElementById("saveContinueBtn").addEventListener("click", async () => {
  if (!currentUser) return;

  const dog = {
    type: "dog",
    name: document.getElementById("dogName").value,
    breed: document.getElementById("dogBreed").value,
    age: document.getElementById("dogAge").value,
    weight: document.getElementById("dogWeight").value,
    color: document.getElementById("dogColor").value
  };

  const cat = {
    type: "cat",
    name: document.getElementById("catName").value,
    breed: document.getElementById("catBreed").value,
    age: document.getElementById("catAge").value,
    weight: document.getElementById("catWeight").value,
    color: document.getElementById("catColor").value
  };

  const userRef = doc(db, "users", currentUser);

  await setDoc(
    userRef,
    {
      pets: {
        dog,
        cat
      }
    },
    { merge: true }
  );

  alert("Pet details saved successfully!");

  // Set last viewed pet (default dog)
  if (dog.name) await updateDoc(userRef, { lastPet: "dog" });
  else if (cat.name) await updateDoc(userRef, { lastPet: "cat" });

  window.location.href = "dashboard.html";
});
