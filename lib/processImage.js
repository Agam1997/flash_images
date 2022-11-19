//dependencies
var AWS = require('aws-sdk');
const fs = require('fs');
var async = require('async');
var removeDir = require('rimraf');
const { promisify } = require('util');
const fastFolderSize = require('fast-folder-size');

//models
var Image = require("../models/images");

//lib files
var enhance = require("./enhance");
var compress = require("./compress");

//bucket url can be anything, directory optional, bucketType mandatory

async function processImage(processObj) {
    // bucketUrl, directory, bucketType, region, accessKeyId, secretAccessKey

    return new Promise(async (resolve, reject) => {

        if (processObj.bucketType == 'public') {

            let bucketName = '';

            if (processObj.bucketUrl.includes("https://")) {
                bucketName = processObj.bucketUrl.split("https://").pop().split(".s3.")[0];
                console.log("BUCKET Name : : ", bucketName);
            } else {
                resolve(false);
            };

            let allFilesInBucket = await getFileFromBucket('', bucketName, processObj.region, processObj.accessKeyId, processObj.secretAccessKey);

            if (allFilesInBucket) {
                console.log("GOT ALL CONTENTS : : ", allFilesInBucket);
                if (processObj.enhance) {
                    let doEnhancement = await enhance(bucketName + "/normal");
                    if (doEnhancement) {
                        const fastFolderSizeAsync = promisify(fastFolderSize)
                        const bytes = await fastFolderSizeAsync(__dirname + "/" + bucketName + "/normal");
                        if (bytes) {
                            console.log("NORMAL FOLDER SIZE IN KB : : : ", (bytes / 1000));
                            removeDir(__dirname + "/" + bucketName + "/normal", () => {
                                console.log("DELETED NORMAL PICTURES WARNING : : : ");
                            });
                        }

                        let doCompression = await compress(bucketName + "/enhanced", bucketName);
                        if (doCompression) {
                            console.log("COMPRESSION DONE HERE : : : ", doCompression);
                            resolve(doCompression);
                        }
                    }
                } else {
                    let doCompression = await compress(bucketName + "/normal", bucketName);
                    if (doCompression) {
                        console.log("COMPRESSION DONE HERE : : : ", doCompression);
                        removeDir(__dirname + "/" + bucketName + "/normal", () => {
                            console.log("DELETED NORMAL PICTURES WARNING : : : ");
                        });
                        resolve(doCompression);
                    }
                }
            }

            //i have 3 scripts, based on commands i can do upscaling, compression and enhancement based on the type of thing required.
            //scaler will not work for now because of ai unpredictable artifaction in the image.
            //for enhancement you can ask if color pop is required on the images, if yes then color saturation increase or else not increase only sharper and gamma correction to make lighting better
            //compress code here

        } //private bucket code here
    });
};

async function getFileFromBucket(marker, bucketName, region, accessKeyId, secretAccessKey) {
    console.log("ap-south-1 : : ", region);


    return new Promise(async (resolve, reject) => {

        if (!fs.existsSync(__dirname + "/" + bucketName)) {
            fs.mkdirSync(__dirname + "/" + bucketName);
        }
        if (!fs.existsSync(__dirname + "/" + bucketName + "/" + "normal"))
            fs.mkdirSync(__dirname + "/" + bucketName + "/" + "normal");
        var returnArr = [];

        AWS.config.update({
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
            region: region
        });

        var s3_public = new AWS.S3();

        var bucketParams = {
            Bucket: bucketName,
            Marker: marker.length ? marker : ''
        };

        s3_public.listObjects(bucketParams, async (err, data) => {
            if (err) {
                console.log("Error", err);
            } else {
                returnArr = [].concat.apply([], data['Contents']);
                if (data.isTrIsTruncated) {
                    await getFileFromBucket(data.NextMarker)
                } else {
                    async.eachSeries(returnArr, function (fileObj, callback) {
                        var key = fileObj.Key;
                        console.log('fileObj.size : : ', fileObj.Size);
                        console.log('Downloading: ' + key);

                        var fileParams = {
                            Bucket: bucketName,
                            Key: key
                        }

                        if (fileObj.Size != 0) {
                            console.log("HERE NOT 0");
                            s3_public.getObject(fileParams, async function (err, fileContents) {
                                if (err) {
                                    // console.log("fileContents.size : : : ", fileContents.size);
                                    callback(err);
                                } else {

                                    fs.writeFileSync(__dirname + "/" + bucketName + '/' + "normal/" + key.split("/").pop(), fileContents.Body);

                                    // let findImageInDb = await Image.find({
                                    //     bucketName: bucketName,
                                    //     awsKey: key
                                    // });

                                    let saveImageData = await Image.findOneAndUpdate({
                                        bucketName: bucketName,
                                        awsKey: key
                                    }, {
                                        $set: {
                                            bucketName: bucketName,
                                            title: key.split("/").pop(), //this local path is wrong check this
                                            awsKey: key
                                        }
                                    }, { upsert: true, new: true });

                                    // if (findImageInDb && findImageInDb.length > 0) {
                                    //     callback();
                                    // } else {
                                    //     let saveImageData = await Image.create({
                                    //         bucketName: bucketName,
                                    //         localPath: (__dirname + '/' + key.split("/").pop()),
                                    //         awsKey: key
                                    //     });

                                    if (saveImageData) {
                                        callback();
                                    }
                                    // }
                                }
                            });
                        } else {
                            callback();
                        }
                    }, function (err) {
                        if (err) {
                            console.log('Failed: ' + err);
                        } else {
                            console.log('Finished');
                            resolve(returnArr);
                        }
                    });
                }
            }
        });
    });
}

module.exports = processImage;