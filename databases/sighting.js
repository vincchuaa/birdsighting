var mongoose = require('mongoose');
var url = "mongodb://127.0.0.1:27017/sighting"
mongoose.Promise = global.Promise;

try {
    connection = mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        checkServerIdentity: false,
    });
    console.log('connection to mongodb worked!');
} catch (e) {
    console.log('error in db connection: ' + e.message);
}