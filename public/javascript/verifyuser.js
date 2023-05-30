/**
 * Listens for the submit button on the nameForm form. Once pressed the button will determine what page content appears
 * - Used for edit.ejs page
 */
document.getElementById('verifyName').addEventListener('submit', function (event) {
    event.preventDefault();

    // Get the field values
    var username = document.getElementById('name');
    var validUsername = document.getElementById('correctuser');
    var notification = document.getElementById('notification');

    if (username.value === validUsername.value) {
        document.getElementById('hiddenContent').style.display = 'block';
        notification.style.display = 'none';
    }
    else {
        notification.style.display = 'block';
        notification.textContent = 'Incorrect username. Please try again.';
    }
});
