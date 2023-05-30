let name = null;
let roomNo = null;
let socket = io();

/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';
``
    // called when loading previous messages onto the chat
    socket.on('previous-messages',data =>{
        if(data.length){
            data.forEach(comment=>{
                writeOnHistory('<b>' + comment.name + ':</b> ' + comment.text);
            })
        }
    });

    // called when someone joins the room. If it is someone else it notifies the joining of the room
    socket.on('joined', function (room, userId) {
        if (userId === name) {
            hideLoginInterface(room, userId);            // it enters the chat
        } else {
            // notifies that someone has joined the room
            writeOnHistory('<b>'+userId+'</b>' + ' joined the chat ');
        }
    });
    // called when a message is received
    socket.on('chat', function (room, userId, chatText) {
        let who = userId
        if (userId === name) who = 'Me';
        writeOnHistory('<b>' + who + ':</b> ' + chatText);
    });
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    name = document.getElementById('name').value;
    roomNo = window.location.pathname.split('/')[2];
    let message = document.getElementById('chat_input').value;
    socket.emit('chat', roomNo, name, message);
}

/**
 * used to connect to a room. It gets
 * - the username from the interface using document.getElementById('').value
 * - uses socket.emit('join') to join the room
 */
function connectToRoom() {
    name = document.getElementById('name').value;
    roomNo = window.location.pathname.split('/')[2];
    socket.emit('join', roomNo, name);
}

/**
 * it appends the given html text to the history div
 * @param text: the text to append
 */
function writeOnHistory(text) {
    let history = document.getElementById('history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('chat_input').value = '';
}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the username
 */
function hideLoginInterface(room, userId){
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('who_you_are').innerHTML= userId;
}

/**
 * Function which handles web page content on load
 */
window.addEventListener('load', () => {
    const chat = document.getElementById('chat_interface');
    const form = document.getElementById('chatform');
    const sightingchat = document.getElementById('sightingchat')
    const username = document.getElementById('username')
    const offlineForm = document.getElementById('offlineForm')

    // Check if the browser is offline
    if (!navigator.onLine) {
        // Hide the form and table container
        form.style.display = 'none';
        chat.style.display = 'none';
        username.style.display = 'none';
        sightingchat.textContent = "You are currently offline, your messages will be sent when back online."
    }
    else {
        offlineForm.style.display = 'none'
    }
});

// Handle successful database open or creation
request.onsuccess = function(event) {
    console.log("IndexedDB opened successfully.");
};

// Handle errors in opening or creating the database
request.onerror = function(event) {
    console.log("Error opening IndexedDB:", event.target.error);
};

document.getElementById('offlineForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission behavior

    if (navigator.onLine) {
        this.submit();
    } else {
        // User is offline, store form data in IndexedDB
        var form = this;

        var commentData = {
            offline_name: form.offline_name.value,
            offline_chat_input: form.offline_chat_input.value,
            offline_time: Date.now()
        };

        var request = window.indexedDB.open(databaseName, 1);

        request.onerror = function(event) {
            console.log('Error opening indexedDB:', event.target.error);
        };

        request.onsuccess = function(event) {
            var db = event.target.result;
            var transaction = db.transaction(['modified-comments'], 'readwrite');
            var store = transaction.objectStore('modified-comments');

            var addRequest = store.add(commentData);

            addRequest.onsuccess = function(event) {
                console.log('Comment data stored in IndexedDB');
                form.reset(); // Clear form for next submission
            };

            addRequest.onerror = function(event) {
                console.log('Error storing comment data:', event.target.error);
            };

            transaction.oncomplete = function() {
                db.close();
            };
        };
    }
});

/**
 * Requests a sync for the event tag 'comment-sync'. This will sync comments made offline to the database by
 * sending a request to the service worker.
 */
async function requestCommentSync() {
    navigator.serviceWorker.ready
        .then(registration => {
            registration.sync.register('comment-sync')
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

window.addEventListener('online', requestCommentSync);