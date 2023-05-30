/**
 * Comment schema for storing bird identification associated with a bird sighting.
 */
const mongoose = require('mongoose')
var Schema = mongoose.Schema

const identificationSchema = new Schema({
    commonname : {type: String, required: true},            //Common name of the bird
    scientificname : {type: String, required: true},        //Scientific name of the bird
    description : {type: String, required: true},           //Short description of the bird
    url : {type: String, required: true}                    //URL link describing the bird identification detail
})

var Identification = mongoose.model('Identification', identificationSchema)

module.exports = Identification