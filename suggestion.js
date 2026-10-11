import { auth, db } from "./firebase_setup.js";
import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

window.submitSuggestion = async function (pageName) {
    const text = document.getElementById("suggestInput").value.trim();
    const msg = document.getElementById("suggestMessage");

    if (text.length < 3) {
        msg.textContent = "Please enter a valid suggestion.";
        msg.style.color = "red";
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        msg.textContent = "Please login first.";
        msg.style.color = "red";
        return;
    }

    try {
        await addDoc(
            collection(db, "users", user.uid, "suggestions"),
            {
                suggestion: text,
                page: pageName,
                timestamp: serverTimestamp()
            }
        );

        msg.textContent = "Your suggestion has been submitted!";
        msg.style.color = "green";

        document.getElementById("suggestInput").value = "";
    } catch (err) {
        msg.textContent = "Error submitting suggestion.";
        msg.style.color = "red";
        console.log(err);
    }
};
