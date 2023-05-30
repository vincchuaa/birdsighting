const Comment = require("../models/comment");
const Sighting = require("../models/sighting")

exports.init = function(io) {
    io.sockets.on('connection', function (socket) {
        try {
            /**
             * Handles the 'join' event when a user wants to join a room.
             *
             * @param {string} room - The bird sighting ID of the room.
             * @param {string} name - The username of the client joining the chatroom.
             */
            socket.on('join', async function (room, name) {
                // prints out the previous chat messages
                try {
                    let sighting = await Sighting.findById(room)
                    const comments = []
                    //Loads the previous comments of the bird sighting
                    for(let i = 0; i < sighting.comments.length; i++){
                        const comment =await Comment.findById(sighting.comments[i]).populate('sighting').exec()
                        comments.push(comment)
                    }
                    socket.emit('previous-messages', comments)
                    socket.join(room)
                    io.sockets.emit('joined', room, name);
                } catch (err) {
                    console.error(err)
                }
            });

            /**
             * Handles the 'chat' event when a user sends a chat message in the bird sighting chatroom.
             *
             * @param {string} room - The bird sighting ID of the room.
             * @param {string} name - The username of the client joining the chatroom.
             * @param {string} chatText - The text of the chat message.
             */
            socket.on('chat', async function(room, name, chatText){
                let sighting
                const comment = new Comment({
                    name: name,
                    text: chatText,
                    createdAt: Date.now()});
                try {
                    //Stores the chat message sent by a user
                    await comment.save()
                    sighting = await Sighting.findById(room)
                    sighting.comments.push(comment.id)
                    await sighting.save()
                    socket.emit('message', chatText);
                    io.sockets.emit('chat',room, name, chatText);
                } catch (err) {
                    console.error(err)
                }
            });
        } catch (e) {
        }
    });
}
