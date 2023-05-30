var locationValue = document.currentScript.getAttribute('location');
locationValue = locationValue.split(',')
var latitude = locationValue[0]
var longitude = locationValue[1]

var sightingLocation = L.map('map').setView([latitude, longitude], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(sightingLocation);

L.marker([latitude, longitude]).addTo(sightingLocation)
    .bindPopup('Bird was spotted here').openPopup();