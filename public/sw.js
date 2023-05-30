//define the files to cache
const filesToCache = [
    "/sightings/index.ejs",
    "/javascript/bootstrap.js",
    "/sightings/new.ejs",
    "/javascript/app.js",
    "/sightings/detail.ejs",
    "/sightings/edit.ejs",
    "/javascript/edit.js",
    "/javascript/verifyuser.js",
    "/javascript/viewmap.js",
    "/javascript/map.js",
    "/javascript/details.js"
];

const CACHE_NAME = 'sightings-app';

/**
 * Listens for the install event, Sets up cache
 */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(filesToCache))
            .then(() => self.skipWaiting())
    );
});

/**
 * Listens for the activate event, prepares cache
 */
self.addEventListener('activate', function (e) {
    console.log('Activating service worker');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== CACHE_NAME) {
                    console.log('Removing cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

/**
 * Listens for fetch events, will take the sightings storec at /sightings and fetch if online.
 * If offline will check cache
 */
self.addEventListener('fetch', function (e) {
    console.log('Service worker fetching...', e.request.url);
    let dataUrl = '/sightings';

    if (e.request.url.indexOf(dataUrl) > -1) {
        e.respondWith(
            fetch(e.request)
                .then((response) => {
                    if (!response.ok || response.status > 299) {
                        console.log("error: " + response.statusText);
                    } else {
                        let responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(e.request, responseClone));
                    }
                    return response;
                })
                .catch((error) => {
                    console.log("Network request failed. Retrieving from cache...");
                    return caches.match(e.request);
                })
        );
    } else {
        e.respondWith(
            fetch(e.request)
                .then((response) => {
                    if (!response.ok || response.status > 299) {
                        console.log("error: " + response.statusText);
                    } else {
                        let responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(e.request, responseClone));
                    }
                    return response;
                })
                .catch((error) => {
                    console.log("Network request failed. Retrieving from cache...");
                    return caches.match(e.request);
                })
                .then((response) => {
                    return response || caches.match(e.request);
                })
        );
    }
});

/**
 * Listens for sync, calls the offlineSync function
 */
self.addEventListener('sync', event => {
    event.waitUntil(offlineSync(event));
});

/**
 * Function which takes an event where if its tag is 'sighting-sync' will upload the sightings stored
 * in the indexedDB object store 'sightings' to the the mongoDB.
 * Another try block is included for this event where the 'modified-sightings' store is checked for any modified sighting,
 * and this is also uploaded from the indexedDB object store to the appropriate locations in mongoDB.
 */
async function offlineSync(event) {
    if (event.tag === 'sighting-sync') {
        try {
            // Retrieve data from IndexedDB table
            const db = await openIndexedDB('sightings-offline');
            const store = db.transaction('sightings', 'readonly').objectStore('sightings');
            const data = await getAllDataFromStore(store);

            for (const sighting of data) {
                // Fetching from offline route
                const response = await fetch("/sightings/offline", {
                    method: "POST",
                    body: JSON.stringify(sighting),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (response.ok) {
                    console.log('Data inserted into MongoDB successfully.');

                } else {
                    throw new Error('Failed to insert data into MongoDB.');
                }
            }
            const deleteTransaction = db.transaction('sightings', 'readwrite');
            const deleteStore = deleteTransaction.objectStore('sightings');
            const deleteRequest = deleteStore.clear();

            deleteRequest.onsuccess = () => {
                console.log('All sightings deleted from IndexedDB.');
            };

            deleteRequest.onerror = (error) => {
                console.error('Error deleting sightings from IndexedDB:', error);
            };

        } catch (error) {
            console.error('Error during offline synchronization:', error);
        }
        try {
            const db = await openIndexedDB('sightings-offline');
            const store = db.transaction('modified-sightings', 'readonly').objectStore('modified-sightings');
            const data = await getAllDataFromStore(store);
            for (const sighting of data) {
                // Fetching from mod route
                const response = await fetch("/sightings/mod", {
                    method: "PUT",
                    body: JSON.stringify(sighting),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                console.log(response)
                if (response.ok) {
                    console.log('Data inserted into MongoDB successfully.');

                } else {
                    throw new Error('Failed to insert data into MongoDB.');
                }
            }
            const deleteTransaction = db.transaction('modified-sightings', 'readwrite');
            const deleteStore = deleteTransaction.objectStore('modified-sightings');
            const deleteRequest = deleteStore.clear();

            deleteRequest.onsuccess = () => {
                console.log('All sightings deleted from IndexedDB.');
            };

            deleteRequest.onerror = (error) => {
                console.error('Error deleting sightings from IndexedDB:', error);
            };

        } catch (error) {
            console.error('Error during offline synchronization:', error);
        }
    }
    //Failure to fetch indexedDB data, but storing data works
    if (event.tag === 'comment-sync') {
        try {
            // Retrieve data from IndexedDB table
            const db = await openIndexedDB('sightings-offline'); // Pass the database name as an argument
            const store = db.transaction('comments', 'readonly').objectStore('comments'); // Specify the store name
            const data = await getAllDataFromStore(store);
            for (const comment of data) {
                const response = await fetch("/sightings/comment", {
                    method: "POST",
                    body: JSON.stringify(comment),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (response.ok) {
                    console.log('Data inserted into MongoDB successfully.');
                } else {
                    throw new Error('Failed to insert data into MongoDB.');
                }
            }
            const deleteTransaction = db.transaction('comments', 'readwrite');
            const deleteStore = deleteTransaction.objectStore('comments');
            const deleteRequest = deleteStore.clear();

            deleteRequest.onsuccess = () => {
                console.log('All comments deleted from IndexedDB.');
            };

            deleteRequest.onerror = (error) => {
                console.error('Error deleting comments from IndexedDB:', error);
            };

            // Output data to the console
            console.log('Data from IndexedDB store:', data);
        } catch (error) {
            console.error('Error during offline synchronization:', error);
        }
    }
}

/**
 * Opens the indexeddb of dbName
 */
async function openIndexedDB(dbName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onerror = () => reject(new Error('Failed to open IndexedDB database.'));
        request.onsuccess = () => resolve(request.result);
    });
}

/**
 * Retrieves all data from the specified object store within an indexedDB
 */
async function getAllDataFromStore(store) {
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(new Error('Failed to retrieve data from IndexedDB store.'));
        request.onsuccess = () => resolve(request.result);
    });
}




