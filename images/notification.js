import { auth, db } from "./firebase_setup.js";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

/* --------------------------------------------------
    ELEMENTS
--------------------------------------------------- */
const notifBtn = document.getElementById("notifBtn");
const notifDot = document.getElementById("notifDot");

/* --------------------------------------------------
    LISTEN FOR NEW NOTIFICATIONS (REALTIME)
--------------------------------------------------- */
auth.onAuthStateChanged(async (user) => {
    if (!user) return;

    const notifRef = doc(db, "users", user.uid, "notifications", "main");

    // create file if not exists
    const snap = await getDoc(notifRef);
    if (!snap.exists()) {
        await setDoc(notifRef, {
            unread: false,
            message: "",
            timestamp: null
        });
    }

    // real-time listener
    onSnapshot(notifRef, (docSnap) => {
        const data = docSnap.data();
        if (!data) return;

        if (data.unread === true) {
            notifDot.style.display = "block"; // show red dot
        } else {
            notifDot.style.display = "none"; // hide
        }
    });
});

/* --------------------------------------------------
    WHEN USER CLICKS ON BELL ICON
--------------------------------------------------- */
if (notifBtn) {
    notifBtn.addEventListener("click", async () => {
        const user = auth.currentUser;
        if (!user) return;

        const notifRef = doc(db, "users", user.uid, "notifications", "main");

        // mark as read
        await updateDoc(notifRef, { unread: false });

        // open admin notifications page
        window.location.href = "admin_panel.html";
    });
}

/* --------------------------------------------------
   FUNCTION FOR ADMIN TO SEND NOTIFICATION
   (You will call this inside admin_panel.js)
--------------------------------------------------- */
export async function sendNotificationToUser(uid, message) {
    const notifRef = doc(db, "users", uid, "notifications", "main");

    await updateDoc(notifRef, {
        unread: true,
        message: message,
        timestamp: Date.now()
    });
}
