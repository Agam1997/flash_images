var mongoose = require('mongoose');

var configSchema = new mongoose.Schema({
    basePath: String,
    key: String,
    token: String,
    // compressedpath: String
}, { timestamps: true });

module.exports = mongoose.model('configs', configSchema);
