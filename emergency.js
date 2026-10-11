// Auto load map with current location
function loadVetMap(lat, lng) {
    const map = document.getElementById("vetMap");
    const url = `https://www.google.com/maps/embed/v1/search?key=AIzaSyAvCOlIvcsc6Y9ZHwVkrFQjfPtSyAF45jA&q=veterinary+clinics&center=${lat},${lng}&zoom=14`;

    map.src = url;
}

// Get user location
navigator.geolocation.getCurrentPosition(
    position => {
        loadVetMap(position.coords.latitude, position.coords.longitude);
    },
    error => {
        alert("Location access denied! Showing default area.");
        loadVetMap(12.9716, 77.5946); // Bangalore default
    }
);

// Button → open Google Maps app directly
document.getElementById("openMaps").addEventListener("click", () => {
    window.open("https://www.google.com/maps/search/veterinary+clinic+near+me/", "_blank");
});

// SOS floating button
document.getElementById("sosBtn").addEventListener("click", () => {
    window.open("https://www.google.com/maps/search/emergency+veterinary+clinic+near+me/", "_blank");
});
