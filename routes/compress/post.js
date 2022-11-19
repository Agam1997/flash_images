var createResponse = require(__dirname + "/../../lib/responseObject");
var mySecret = process.env.mySecret;
var processImage = require(__dirname + "/../../lib/processImage");
var Image = require(__dirname + "/../../models/images.js");
var uploadToS3 = require(__dirname + "/../../lib/uploadToS3");

module.exports = {
    compress: async (req, res, next) => {

        if (!req.body.secret || req.body.secret !== mySecret) {
            console.log("HERE");
            return res.send(createResponse(400, "No U", "", ""));
        };

        // if (req.body.bucketType == 'public') {

        if (!req.body.bucketUrl || !req.body.region || !req.body.secretAccessKey || !req.body.accessKeyId) {
            console.log("here");
            return res.status(400).send(createResponse(400, "required fields missing in post request", "", ""));
        };
        if (!req.body.bucketType || req.body.bucketType != ('public' || 'private')) {
            console.log("here");
            return res.status(400).send(createResponse(400, "required fields missing in post request", "", ""));
        }

        let bucketUrl = req.body.bucketUrl;
        let path = req.body.path ? req.body.path : '';
        let bucketType = req.body.bucketType
        let region = req.body.region;
        let accessKeyId = req.body.accessKeyId;
        let secretAccessKey = req.body.secretAccessKey;
        let enhance = req.body.enhance ? true : false

        let processObj = {
            bucketUrl: bucketUrl,
            path: path,
            bucketType: bucketType,
            region: region,
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
            enhance: enhance,

        }

        let doImageProcess = await processImage(processObj);
        // if (doImageProcess) {
        //time to upload images
        console.log("COMPRESSOR SE : : : OBJ : : : ", doImageProcess);
        if (doImageProcess.compressedDir) {
            let upload = await uploadToS3(processObj, doImageProcess);
            if (upload) {
                console.log("----------------------------UPLOADING DONE BRO-------------------------------");
                console.log("\nLOG RESP : : ", upload);
            }
        }
        // }

        if (doImageProcess) {
            if (doImageProcess['message']) {
                console.log("GO");
                return res.status(204).send(createResponse(204, "Not modified. Directory has all compressed images", ""));
            }
            return res.status(200).send(createResponse(200, "Congrats check your bucket it should be reduced in size", "", doImageProcess));
        } else {
            return res.status(400).send(createResponse(400, "Something wrong contact flash images", "", ""));
        }
        // }
    }
}