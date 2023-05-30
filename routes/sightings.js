const express = require('express')
const router = express.Router()
const Sighting = require('../models/sighting')
const sightings = require('../controllers/sighting')
const identifications = require('../controllers/identification')
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
        var original = file.originalname;
        var file_extension = original.split(".");
        filename = Date.now() + '.' + file_extension[file_extension.length-1];
        cb(null, filename);
    }
});
var upload = multer({ storage: storage });


router.get('/', sightings.findSighting)

router.post('/new', identifications.getIdentification)

router.post('/:id/edit', identifications.getIdentificationEdit)

router.post('/offline', upload.single('photo'),sightings.saveOfflineSighting)

router.post('/comment', sightings.saveOfflineComment)

router.get('/new', (req,res) => {
    res.render('sightings/new', {sighting: new Sighting(), data : [], sparqlResults: []})
})

router.get('/:id/detail', sightings.getSighting)

router.post('/', upload.single('photo'),sightings.saveSighting)

router.get('/:id', sightings.getSighting)

router.get('/:id/edit', sightings.editSighting)

router.post('/:id', sightings.updateSighting)

router.put('/mod', sightings.saveModifiedSighting)

module.exports = router