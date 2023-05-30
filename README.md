# BirdSighting
This project enables users to record and view bird sightings. Users can create bird sighting records by selecting a location on a map, specifying the time, and identifying the bird type. The project also includes a chatroom for each sighting to facilitate discussions and sharing among users.

# Installation
1. Clone this repository by calling `git clone https://github.com/HarryAkrill/intelligent_web_team_u02.git`.
2. Install node.js plugin in your IDE.
3. Run `npm install`.
4. Install version 4.4 of the MongoDB for your machine from `https://www.mongodb.com/download-center/community`.
5. Setup the MongoDB configuration according to section MongoDB Configuration.

## MongoDB Configuration
1. Open your command prompt and navigate to your C drive.
2. Create a directory using the command `mkdir data/db`.
3. Set up the environmental path for MongoDB by copying the path of the MongoDB bin folder.
4. Run `mongod` in the command prompt.
5. Run `mongo` in the command prompt.

# Usage
1. Run the localhost server.
2. Enter the website by calling `http://localhost:3000/` on your preffered web browser.
3. Select Add Sighting button to add a sighting.
4. Fill in the bird sighting information in the form and press create.
5. Select View Detail button to check detailed information and comments.
6. Enter your username for accessing the chatroom.

# Offline Usage
1. Open your browser dev tools.
2. Click the 'network' tab and click 'offline'.
3. Refresh your page and enter offline data.
4. When you wish to go back online, go to the network tab and choose the appropriate online button.
5. Refresh your page.

# Features
- Bird Sighting Record Creation: Provide an interactive UI for users to create bird sightings with real map pinpointing for precise location.
- Dynamic Bird Sighting Chatrooms: Each bird sighting gets its own dedicated chatroom with a complete chat history.
- Bird Type Identification with DBPedia Integration: Allow users to choose various bird identification with DBPedia, a comprehensive knowledge base from WikiPedia.
- Offline and Online Interaction: Enjoy uninterrupted usage of the website with support for both offline and online modes.

# Running Functionality
- To add a new sighting, press the add sighting button and fill in the relevant sighting information. If you are looking for an identification through DBpedia, use the search form.
- To edit a sighting when a sighting exists, click the edit button on the home page of the website and edit the relevant identification information.
- To view the details of a sighting, press the view details button.
- To chat about a sighting, press the view details button and use the chat interface to message. This is updated in real time.
- To use the offline functionality, refer to the 'offline usage' section of the readme file.
- To sort sightings on the home page, click on the 'sort by' button, and choose your preferred sorting method.

# Demo
- https://drive.google.com/drive/folders/1tYIQ3uTB6gqyMFrfUD2-cPX0hCkktenX?usp=sharing
- Indicates key indexedDB, socket.io, service worker, offline and online functionality.

# Dependencies
Run `npm install` to install the dependencies in package.json. The following lists some main dependencies used in this project:
- Express
- Socket.io
- MongoDB
- node-fetch

 
