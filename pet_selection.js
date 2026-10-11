// FINAL, CLEAN, FULLY WORKING VERSION — NO ERRORS

import { auth, db } from "./firebase_setup.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// WAIT FOR FIREBASE TO GIVE US USER INFO
auth.onAuthStateChanged(async (user) => {

    if (!user) {
        window.location.href = "login_page.html";
        return;
    }

    // CHECK IF USER ALREADY HAS PET DATA
    try {
        const petDoc = await getDoc(doc(db, "users", user.uid, "pets", "data"));

        if (petDoc.exists()) {
            // USER COMPLETED SETUP → SEND TO DASHBOARD
            window.location.href = "dashboard.html";
            return;
        }
    } catch (err) {
        console.error("Error reading Firestore:", err);
    }

    // ATTACH BUTTON AFTER USER LOADED
    document.getElementById("continueBtn").addEventListener("click", async () => {

        const dog = document.getElementById("dogCheck").checked;
        const cat = document.getElementById("catCheck").checked;

        if (!dog && !cat) {
            alert("Please select at least one pet.");
            return;
        }

        try {
            await setDoc(doc(db, "users", user.uid, "profile", "petSelection"), {
                dog: dog,
                cat: cat,
                updatedAt: new Date().toISOString()
            });

            window.location.href = "pet_details.html";
        } catch (err) {
            console.error(err);
            alert("Something went wrong. Try again.");
        }
    });
});
