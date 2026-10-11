import { auth, db } from "./firebase_setup.js";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

/* Elements */
const weightInput = document.getElementById("weightInput");
const addWeightBtn = document.getElementById("addWeightBtn");
const chartCanvas = document.getElementById("weightChart");

let chart; // chart instance

/* Load Weight Data */
function loadWeightHistory() {
    auth.onAuthStateChanged((user) => {
        if (!user) return;

        const q = query(
            collection(db, "users", user.uid, "weight_tracker"),
            orderBy("timestamp", "asc")
        );

        onSnapshot(q, (snapshot) => {
            const weights = [];
            const dates = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                weights.push(data.weight);
                dates.push(new Date(data.timestamp.toDate()).toLocaleDateString());
            });

            updateChart(dates, weights);
        });
    });
}

/* Update Chart */
function updateChart(labels, dataValues) {
    if (chart) chart.destroy();

    chart = new Chart(chartCanvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Weight (kg)",
                    data: dataValues,
                    borderColor: "#3e7cb1",
                    borderWidth: 3,
                    tension: 0.35,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
}

/* Add New Weight Entry */
addWeightBtn.addEventListener("click", async () => {
    const value = parseFloat(weightInput.value);

    if (isNaN(value) || value <= 0) {
        alert("Please enter a valid weight.");
        return;
    }

    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "users", user.uid, "weight_tracker"), {
        weight: value,
        timestamp: serverTimestamp()
    });

    weightInput.value = "";
});

/* Start */
loadWeightHistory();
