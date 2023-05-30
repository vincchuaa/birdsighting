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

if (!window.indexedDB) {
    console.log("IndexedDB is not supported in this browser.");
}

var databaseName = "sightings-offline";
var databaseVersion = 1;

// Open or create the IndexedDB database
var request = window.indexedDB.open(databaseName, databaseVersion);

request.onsuccess = function(event) {
    console.log("IndexedDB opened successfully.");
};

request.onerror = function(event) {
    console.log("Error opening IndexedDB:", event.target.error);
};

/**
 * Function which has an event listener for the edit-sighting form on submit. The function uploads the edited offline sighting
 * data to the indexedDB
 */
document.getElementById('edit-sighting').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission behavior

    if (navigator.onLine) {
        // User is online, proceed with regular form submission
        this.submit();
    } else {
        // User is offline, store form data in IndexedDB
        var form = this;

        var sightingData = {
            idnumber: form.idnumber.value,
            idname: form.idcommon.value,
            idsciname: form.idscientific.value,
            iddescription: form.iddescription.value,
            idURI: form.idURI.value
            // Capture other form field values as needed
        };

            // Store the data in IndexedDB
        var request = window.indexedDB.open(databaseName, 1);

        request.onerror = function(event) {
            console.log('Error opening indexedDB:', event.target.error);
        };

        request.onsuccess = function(event) {
            var db = event.target.result;
            var transaction = db.transaction(['modified-sightings'], 'readwrite');
            var store = transaction.objectStore('modified-sightings');

            var addRequest = store.add(sightingData);

            addRequest.onsuccess = function(event) {
                console.log('Sighting data stored in IndexedDB');
                form.reset(); // Optionally clear the form fields after storing data
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
            var store = db.createObjectStore('modified-sightings', { keyPath: 'id', autoIncrement: true });
                // Define the object store's schema as needed
        };
    }
});

/**
 * Registers the sync for 'sighting-sync'
 */
async function requestModifiedSync() {
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

window.addEventListener('online', requestModifiedSync);

/**
 * Function which handles the webpage content on loading
 */

window.addEventListener('load', () => {
    const form = document.getElementById('searchForm');
    const tableContainer = document.getElementById('tableContainer');
    const searchtag = document.getElementById('searchtag');

    // If user is offline
    if (!navigator.onLine) {
        form.style.display = 'none';
        tableContainer.style.display = 'none';
        searchtag.textContent = "You are currently offline so DBPedia fetch is unavailable. Please Enter your identification manually, or leave blank for unknown.";
    }
});