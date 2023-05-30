/**
 * Comment schema for storing comments associated with a bird sighting.
 */
const mongoose = require('mongoose')
var Schema = mongoose.Schema

const commentSchema = new Schema({
    name : {type: String, required: true},      //Username of a user
    text : {type: String, required: true},      //Text content of the chat comment
    createdAt : {type: Date, required: true}    //Timestamp when the chat message is sent
})

var Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment