var mongoose = require('mongoose');

var compressImageSchema = new mongoose.Schema({
    bucketName: String,
    title: String,
    awsKey: String,
    compressedpath: String
}, { timestamps: true });

module.exports = mongoose.model('compressImages', compressImageSchema);
