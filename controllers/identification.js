const Identification = require("../models/identification");
const fetch = require('node-fetch');
const Sighting = require("../models/sighting");

/**
 * Save a birds identification to the mongoDB database according to the request data
 */
exports.saveIdentification = async function(req, res) {
    const identification = new Identification({
        name : req.body.name,
        description : req.body.description,
        url : req.body.url
    });
    try {
        await identification.save()
        res.redirect('sightings')
    } catch {
        res.render('sightings/new', {error: 'Error creating sighting'})
    }
}

/**
 * Get a birds identification according to the entered bird name in the request
 */
exports.getIdentification = async (req, res) => {
    const birdName = req.body.birdName;
    const sparqlQuery = `
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX dbp: <http://dbpedia.org/property/>

        SELECT ?uri (str(?name) AS ?commonName) (str(?description) AS ?description) (str(?genus) AS ?genus) (str(?species) AS ?species) WHERE {
            ?uri a dbo:Bird ;
        rdfs:label ?name .
            OPTIONAL {
            ?uri dbo:abstract ?description .
            ?uri dbp:genus ?genus .
            ?uri dbp:species ?species .
        FILTER (lang(?description) = "en")
        }
        FILTER (
            langMatches(lang(?name), "en") && (
                regex(?name, "${birdName}", "i")
            )
        )
        }
    `;
    try {
        const endpoint = 'https://dbpedia.org/sparql';
        const queryUrl = `${endpoint}?query=${encodeURIComponent(sparqlQuery)}&format=json`;

        const response = await fetch(queryUrl, { headers: { Accept: 'application/sparql-results+json' } });
        const jsonResult = await response.json();

        // Extract the bindings from the JSON result
        const sparqlResults = jsonResult.results.bindings;

        // Send the results back as a response
        res.render('sightings/new', {sparqlResults, sighting: new Sighting()})
    } catch (error) {
        console.error('Error with query:', error);
        res.status(500).json({ error: 'No results found' });
    }
}

/**
 * Get a birds identification according to bird name in the edit view, differs from above method in data which is added to render method
 */
exports.getIdentificationEdit = async (req, res) => {
    const birdName = req.body.birdName;
    const sighting = await Sighting.findById(req.body.sightingID)
    const identification = await Identification.findById(req.body.identificationID)
    const sparqlQuery = `
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX dbp: <http://dbpedia.org/property/>

        SELECT ?uri (str(?name) AS ?commonName) (str(?description) AS ?description) (str(?genus) AS ?genus) (str(?species) AS ?species) WHERE {
            ?uri a dbo:Bird ;
        rdfs:label ?name .
            OPTIONAL {
            ?uri dbo:abstract ?description .
            ?uri dbp:genus ?genus .
            ?uri dbp:species ?species .
        FILTER (lang(?description) = "en")
        }
        FILTER (
            langMatches(lang(?name), "en") && (
                regex(?name, "${birdName}", "i")
            )
        )
        }
    `;
    try {
        const endpoint = 'https://dbpedia.org/sparql';
        const queryUrl = `${endpoint}?query=${encodeURIComponent(sparqlQuery)}&format=json`;

        const response = await fetch(queryUrl, { headers: { Accept: 'application/sparql-results+json' } });
        const jsonResult = await response.json();

        // Extract the bindings from the JSON result
        const sparqlResults = jsonResult.results.bindings;

        // Send the results back as a response
        res.render("sightings/edit", {sparqlResults, sighting, identification})
    } catch (error) {
        console.error('Error with query:', error);
        res.status(500).json({ error: 'No results found' });
    }
}

