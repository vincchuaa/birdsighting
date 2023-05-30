/**
 * Comment schema for storing a bird sighting.
 */
const mongoose = require('mongoose')
var Schema = mongoose.Schema

const sightingSchema = new Schema({
    username : {type: String, required: true},              //Username
    location : {type: [Number,Number], required: true},     //Latitude and longitude of the bird location
    date : {type: Date, required: true},                    //Date when the bird is found
    shortdescription : {type: String, required: true},      //Short description of the bird
    photo: {type: String, required: true},                  //Bird sighting photo
    identification: {type: Schema.Types.ObjectId,           //Bird identification
        required: true, ref:'Identification'},
    comments: []                                            //All chat messages of the bird sighting
})

var Sighting = mongoose.model('Sighting', sightingSchema)

module.exports = Sighting