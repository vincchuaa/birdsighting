/**
 * Initializes the registration of a service worker.
 */
function initSightings() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('/sw.js')
            .then(function() { console.log('Service Worker Registered'); })
            .catch(error => {
                console.log('Service worker registration failed:', error);
            });

    }
}
initSightings()

// Check if the browser supports IndexedDB
if (!window.indexedDB) {
    console.log("IndexedDB is not supported in this browser.");
}
var databaseName = "sightings-offline";

// Open or create the IndexedDB database
var request = window.indexedDB.open(databaseName, 1);

// Handle database upgrade or creation
request.onupgradeneeded = function(event) {
    var db = event.target.result;

    // Create object stores for new sightings, modified sightings, and modified comments. ALl made while offline
    var objectStore = db.createObjectStore("sightings", { keyPath: "id", autoIncrement: true });
    var objectStore = db.createObjectStore('modified-sightings', { keyPath: "id", autoIncrement: true });
    var objectStore = db.createObjectStore('modified-comments', { keyPath: "id", autoIncrement: true });

};

request.onsuccess = function(event) {
    console.log("IndexedDB opened successfully.");
};

request.onerror = function(event) {
    console.log("Error opening IndexedDB:", event.target.error);
};

/**
 * Event listener function for the form submission of "new-sighting".
 * Handles the form submission according to the user's online/offline status.
 *
 * @param {Event} event - The form submission event.
 */
document.getElementById('new-sighting').addEventListener('submit', function(event) {
    event.preventDefault();

    if (navigator.onLine) {
        this.submit();
    } else {
        // User is offline, store form data in IndexedDB
        var form = this;

        var sightingData = {
            username: form.username.value,
            location: [form.locationlat.value, form.locationlong.value],
            day: form.day.value,
            time: form.time.value,
            shortdescription: form.shortdescription.value,
            idname: form.idname.value,
            idsciname: form.idsciname.value,
            iddescription: form.iddescription.value,
            idURI: form.idURI.value
        };

        // Prepare image to be uploaded and file location stored
        var fileInput = form.photo;
        var imageFile = fileInput.files[0];
        var reader = new FileReader();

        reader.onload = function(event) {
            var imageData = event.target.result;


            sightingData.photo = imageData;

            var request = window.indexedDB.open(databaseName, 1);

            request.onerror = function(event) {
                console.log('Error opening indexedDB:', event.target.error);
            };

            request.onsuccess = function(event) {
                var db = event.target.result;
                var transaction = db.transaction(['sightings'], 'readwrite');
                var store = transaction.objectStore('sightings');

                var addRequest = store.add(sightingData);

                addRequest.onsuccess = function(event) {
                    console.log('Sighting data stored in IndexedDB');
                    form.reset();
                };

                addRequest.onerror = function(event) {
                    console.log('Error storing sighting data:', event.target.error);
                };

                transaction.oncomplete = function() {
                    db.close();
                };
            };
            request.onupgradeneeded = function(event) {
                var db = event.target.result;
                var store = db.createObjectStore('sightings', { keyPath: 'id', autoIncrement: true });
            };
        };

        // Read the image file as data URL
        reader.readAsDataURL(imageFile);
    }
});
/**
 * Function which provides background sync for tag 'sighting-sync'
 */
async function requestBackgroundSync() {
    navigator.serviceWorker.ready
        .then(registration => {
            registration.sync.register('sighting-sync')
                .then(() => {
                    console.log('Background sync registered');
                })
                .catch(error => {
                    console.error('Background sync registration failed:', error);
                });
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}

// When online, request a background sync
window.addEventListener('online', requestBackgroundSync);


/**
 * Function which handles the document elements when the page loads
 */
window.addEventListener('load', () => {
    const form = document.getElementById('searchForm');
    const tableContainer = document.getElementById('tableContainer');
    const searchtag = document.getElementById('searchtag');

    // Check if the browser is offline
    if (!navigator.onLine) {
    // Hide the form and table container
        form.style.display = 'none';
        tableContainer.style.display = 'none';
        searchtag.textContent = "You are currently offline so DBPedia fetch is unavailable. Please Enter your identification manually, or leave blank for unknown.";
    }
});
