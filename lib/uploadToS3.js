var AWS = require('aws-sdk');
// const { S3Client, PutObjectCommand } = require("aws-sdk/clients/s3");
const fs = require('fs');
var async = require('async');
var removeDir = require('rimraf');
var Image = require("../models/images");

async function uploadToS3(processObj, doImageProcess) {
    return new Promise(async (resolve, reject) => {
        //upload with same key
        console.log("--------------------------UPLOADING STARTED DOWN------------------------------");
        let bucketName = '';

        if (processObj.bucketUrl.includes("https://")) {
            bucketName = processObj.bucketUrl.split("https://").pop().split(".s3.")[0];
            console.log("BUCKET Name : : ", bucketName);
        };

        // let foundImages = await Image.find({
        //     bucketName: bucketName,
        // });
        let keys = [];


        //got array of all the images
        // if (foundImages) {

            // console.log("\n\nTRYING UPLOAD FROM DIR : : : : ", foundImage[0].compressedpath, " && AWS KEY ; : : : ", key);
            const S3 = new AWS.S3({
                accessKeyId: processObj.accessKeyId,
                secretAccessKey: processObj.secretAccessKey,
                region: processObj.region
            });

            fs.readdir(doImageProcess.compressedDir, async function (err, files) {
                console.log("FILES : ::", files);
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }

                // let promiseArr = [];
                for (var i = 0; i < files.length; i++) {

                    let getImageObj = await Image.findOne({ title: files[i] });

                    if (getImageObj) {
                        const readStream = fs.createReadStream(getImageObj.compressedpath + "/" + files[i]);

                        var bucketParams = {
                            Bucket: bucketName,
                            ACL: "public-read",
                            Key: getImageObj.awsKey,
                            Body: readStream
                        };

                        // console.log("\nbucketParams : : : ", bucketParams)

                        // const data = await s3.send(new PutObjectCommand(bucketParams));
                        const data = await S3.upload(bucketParams).promise();

                        if (data) {
                            continue
                        }
                    }

                }

                resolve(true);
            })
            // let promiseArr = [];



            // for (var i = 0; i < foundImages.length; i++) {

            //     //insert in promise array files to upload

            //     promiseArr.push(initiateUpload(foundImages[i].compressedpath, foundImages[i].awsKey, processObj, bucketName));

            //     if (promiseArr.length > 5) {
            //         console.log("UPLOADING 5 in one time");
            //         await Promise.all(promiseArr).then((resp) => {
            //             console.log("uploaded : : ", resp);
            //         });

            //         promiseArr = [];
            //     }
            // }
            // if (promiseArr > 0) {
            //     await Promise.all(promiseArr).then((resp) => {
            //         console.log("UPLOAD REMAINGIN DONE : : :", resp);
            //         resolve(true)
            //     });
            // };
        // }

        // const readStream = fs.createReadStream(item);


    });
}

async function initiateUpload(fileDir, key, processObj, bucketName) {
    return new Promise((resolve, reject) => {

        console.log("TRYING UPLOAD OF : : : ", fileDir, " && AWS KEY ; : : : ", key);
        const s3_upload = new S3Client({
            accessKeyId: processObj.accessKeyId,
            secretAccessKey: processObj.secretAccessKey,
            region: processObj.region
        });

        fs.readdir(fileDir, async function (err, files) {
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }

            // let promiseArr = [];
            for (var i = 0; i < files.length; i++) {

                const readStream = fs.createReadStream(files[i]);

                var bucketParams = {
                    Bucket: bucketName,
                    ACL: "public-read",
                    key: key,
                    Body: readStream
                };

                const data = await s3.send(new PutObjectCommand(bucketParams));

                if (data) {
                    continue
                }
            }

            resolve(true);
        })

        // const readStream = fs.createReadStream(file);
        // AWS.config.update({
        //     accessKeyId: processObj.accessKeyId,
        //     secretAccessKey: processObj.secretAccessKey,
        //     region: processObj.region
        // });

        // var s3_upload = new AWS.S3();

        // //get ket and path of file to upload here

        // var bucketParams = {
        //     Bucket: bucketName,
        //     ACL: "public-read",
        //     key: key,
        //     Body: readStream
        // };

        // s3_upload.upload(bucketParams)
        //     .on("httpUploadProgress", (progress) => {
        //         console.log('progress', progress)
        //     })
        //     .send(async (err, data) => {
        //         if (data) {
        //             console.log("DONE : :", data);
        //             uploadTryCount = 0;
        //             resolve(true);
        //         } else {
        //             resolve(err);
        //             console.log("ERR IN FILE UPLAOD : : : ", err);
        //         }
        //     });
    })
}

let processObj = {
    "secret": "banana",
    "bucketUrl": "https://images-by-agam.s3.ap-south-1.amazonaws.com/new_folder",
    "region": "ap-south-1",
    "bucketType": "public",
    "accessKeyId": "AKIA2URB324FTVOBBB4K",
    "secretAccessKey": "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",
    "enhance": true
};

// uploadToS3(processObj);


module.exports = uploadToS3;