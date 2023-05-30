/**
 * Leaflet map API - https://leafletjs.com/examples/quick-start/
 * - Volodymyr Agafonkin
 * Adapted for form of project, but large map basis formed from this API
 */

const sightingMap = L.map('map').setView([54, -1.2], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(sightingMap);

const locationMarker = L.popup() // creates a marker on the map to indicate where the user has clicked
    .setLatLng([54,-1.2]).setContent('Set the location of the bird.').openOn(sightingMap);

/**
 * Handles click event of the map
 * @param e - The event object
 */
function onMapClick(e) {
    locationMarker.setLatLng(e.latlng).setContent(`The bird is located at ${e.latlng.toString()}`).openOn(sightingMap);

    //Set the values of locationlat and locationlong input fields to the clicked latitude and longitude
    document.getElementById('locationlat').value = e.latlng.lat;
    document.getElementById('locationlong').value = e.latlng.lng;
}

sightingMap.on('click', onMapClick);