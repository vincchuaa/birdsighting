const Sighting = require("../models/sighting");
const Comment = require("../models/comment");
const Identification = require("../models/identification");
const path = require('path');
const fs = require('fs')

/**
 * Save a bird sighting according to the data within the request. If identification data is unknown then an UNKNOWN is returned.
 */
exports.saveSighting = async function(req, res) {
    const day = req.body.day
    const time = req.body.time
    const date = new Date(`${day} ${time}`);
    const long = req.body.locationlong
    const lat = req.body.locationlat

    //Store the bird identification as UNKNOWN if no identification is chosen
    const identification = new Identification( {
        commonname: req.body.idname || "UNKNOWN",
        scientificname : req.body.idsciname || "UNKNOWN",
        description: req.body.iddescription || "UNKNOWN",
        url : req.body.idURI || "UNKNOWN"
    })
    try {
        await identification.save()
    } catch {}

    const sighting = new Sighting({
        shortdescription: req.body.shortdescription,
        username: req.body.username, //Placeholder
        date: date,
        location: [lat,long],
        photo: req.file.path,
        identification : identification,
        comments: []
    });
    try {
        await sighting.save()
        res.redirect('sightings')
    } catch {
        res.redirect('sightings')
    }
}

/**
 * When the user is going from offline to online, save a bird sighting according to the request data from the indexedDB.
 * Save the image in base64
 */
exports.saveOfflineSighting = async function(req,res) {
    const day = req.body.day
    const time = req.body.time
    const date = new Date(`${day} ${time}`);
    const identification = new Identification( {
        commonname: req.body.idname || "UNKNOWN",
        scientificname : req.body.idsciname || "UNKNOWN",
        description: req.body.iddescription || "UNKNOWN",
        url : req.body.idURI || "UNKNOWN",
    })
    try {
        await identification.save()
    } catch {

    }
    const imageData = req.body.photo;
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

    const filename = `${Date.now()}.png`;
    const newFileName = path.join('public', 'images', filename);
    const savePath = path.join(__dirname, '../public/images', filename);

    try {
        fs.writeFileSync(savePath, base64Data, 'base64');
        console.log('Image saved to sighting');
    } catch (err) {
        console.error('Error saving image:', err);
    }
    const sighting = new Sighting({
        shortdescription: req.body.shortdescription,
        username: req.body.username,
        date: date,
        location: req.body.location,
        photo: newFileName,
        identification: identification,
        comments: []
    });

    try {
        await sighting.save()
        res.redirect('sightings')
    } catch {
        res.redirect('sightings')
    }
}
/**
 * Save a sighting according to the request data from the indexedDB. This is saved when the user goes from offline to online.
 */
exports.saveModifiedSighting = async function(req, res) {
    const identification = await Identification.findById(req.body.idnumber)
    identification.commonname = req.body.idname || "UNKNOWN"
    identification.scientificname = req.body.idsciname || "UNKNOWN"
    identification.description = req.body.iddescription || "UNKNOWN"
    identification.url = req.body.idURI || "UNKNOWN"

    try {
        await identification.save()

    } catch {
        console.log('Identification failed to save')
    }
}

/**
 * Return a sightings index page with all of the sightings within the mongoDB database
 */

exports.findSighting = async function(req, res) {
    try {
        let order = 1; // Default sort direction is ascending

        if (req.query.sort === 'desc') {
            order = -1; // Set sort direction to descending if query parameter is 'desc'
        }

        const sightings = await Sighting.find({}).sort({ date: order }).exec();
        let sortedSightings

        if (req.query.sort === 'loc'){
            if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition( async(position)=>{
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    // Sort sightings by distance (closest to your geolocation)
                    sortedSightings = sightingsWithDistance.sort(
                        (a, b) => a.distance - b.distance
                    );
                });
            }
        }

        const identifications = [];
        const unknownIdentifications = [];
        const knownIdentifications = [];
        for (let i = 0; i < sightings.length; i++) {
            identifications[i] = await Identification.findById(sightings[i].identification).populate('sighting').exec();

            if(identifications[i].commonname === "UNKNOWN"){
                unknownIdentifications.push(identifications[i]);
            }
            else{
                knownIdentifications.push(identifications[i]);
            }
        }
        const sortedIdentifications = knownIdentifications.concat(unknownIdentifications);

        if(req.query.sort === 'id'){
            const sightings = [];

            for (let i = 0; i < sortedIdentifications.length; i++) {
                sightings[i] = await Sighting.findOne({identification: sortedIdentifications[i].id}).exec();
                console.log(sightings[i]);
            }

            res.render('sightings/index', { sightings: sightings,
                identifications: sortedIdentifications });
        }

        else {
            res.render('sightings/index', {sightings: sightings, identifications: identifications});
        }

    } catch {
        res.redirect('/');
    }
};

/**
 * Retrieve the selected bird sighting in the request. Render the detail page of that bird with appropriate sighting information.
 */
exports.getSighting = async function(req,res) {
    try {
        const sighting = await Sighting.findById(req.params.id)
        const identification = await Identification.findById(sighting.identification).populate('sighting').exec()
        const comments = []
        for(let i = 0; i < sighting.comments.length; i++){
            const comment =await Comment.findById(sighting.comments[i]).populate('sighting').exec()
            comments.push(comment)
        }
        res.render('sightings/detail', {sighting:sighting, identification:identification,comments:comments})
    } catch {
        res.redirect('/sightings')
    }
}

/**
 * Retrieve the appropriate data for editing a sighting. Render the edit page of that bird with appropriate information.
 */
exports.editSighting = async function(req,res) {
    try {
        const sighting = await Sighting.findById(req.params.id)
        const identification = await Identification.findById(sighting.identification)
        res.render('sightings/edit', {sighting: sighting, identification:identification, sparqlResults: []})
    } catch {
        res.redirect('/sightings')
    }
}

/**
 * Update the sighting which has been edited
 */
exports.updateSighting = async function(req,res) {
    try {
        const sighting = await Sighting.findById(req.params.id)
        const identification = await Identification.findById(sighting.identification)
        identification.commonname = req.body.idcommon
        identification.scientificname = req.body.idscientific
        identification.description = req.body.iddescription
        identification.url = req.body.idURI
        await identification.save()
        res.redirect('/sightings/')
    } catch {
        res.redirect('/sightings/')
    }
}

/**
 * When going from offline to online, save the comments which were made while the user was offline. These comments
 * were stored in an indexedDB.
 */
exports.saveOfflineComment = async function(req,res){
    let sighting
    const comment = new Comment({
        name: req.body.offline_name,
        text: req.body.offline_chat_input,
        createdAt: Date.now()});
    try {
        await comment.save()
        sighting = await Sighting.findById(window.location.pathname.split('/')[2])
        sighting.comments.push(comment.id)
        await sighting.save()
    } catch (err){
        console.error(err)
    }
}