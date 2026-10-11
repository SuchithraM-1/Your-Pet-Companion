document.getElementById("adminLoginBtn").addEventListener("click", () => {

    const email = document.getElementById("adminEmail").value;
    const pass = document.getElementById("adminPassword").value;

    // Hardcoded Admin Account
    const ADMIN_EMAIL = "admin@petcompanion.com";
    const ADMIN_PASS = "admin123";

    if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
        localStorage.setItem("adminLoggedIn", "true");
        window.location.href = "admin_dashboard.html";
    } else {
        alert("Invalid admin credentials!");
    }
});
