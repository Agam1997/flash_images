var Image = require(__dirname + "/../../models/images");
var Config = require(__dirname + "/../../models/config");
var mongoose = require('mongoose');
const fs = require('fs');
const Path = require('path');
const Axios = require('axios');
let sharp = require('sharp');
const fsp = fs.promises;
var ObjectId = mongoose.Types.ObjectId;

module.exports = {
    transform: async (req, res, next) => {
        console.log("transforming youuuuu", req.params.configId, req.params.trData, req.params.imageUrl);

        let configObj = await Config.findById(ObjectId(req.params.configId));

        console.log("GOTCHA : ", configObj);

        let trData;

        let transformationObj = {};
        if (req.query.w && req.query.w.length > 0) {
            transformationObj['w'] = req.query.w;
        }
        if (req.query.h && req.query.h.length > 0) {
            transformationObj['h'] = req.query.h;
        }
        if (req.query.format && req.query.format.length > 0) {
            transformationObj['format'] = req.query.format;
        }
        // if (req.params.trData) {
        //     if (req.params.trData.includes("-w") || req.params.trData.includes("-h") || req.params.trData.includes("-f")) {
        //         trData = req.params.trData.split("-")
        //         if (trData.length > 1) {
        //             trData.forEach((trInfo) => {
        //                 transformationObj[trInfo.substr(0, 1)] = trInfo.substr(1);
        //             });
        //         } else {
        //             transformationObj[trData[0].substr(0, 1)] = trData[0].substr(1);
        //         }
        //         console.log(transformationObj);
        //     } else {
        //         req.params.imageUrl = req.params.trData + "/" + req.params.imageUrl
        //     }
        // }

        //ready for resize

        // req.params.imageUrl = encodeURIComponent(req.params.imageUrl);

        console.log("READY : : ", req.params.imageUrl);

        console.log("req.originalUrl : ", req.originalUrl);

        let requestedURI = req.originalUrl.split(req.params.configId).pop().substr(1); //remove slash at start

        if (configObj && configObj.basePath) {
            // console.log("HERE");
            if (!(requestedURI.includes("https") || requestedURI.includes("https"))) {
                // console.log("NO HTTPS");
                res.setTimeout(20000, function () {
                    console.log(">>>Big issue: Request has timed out.<<<");
                    // return res.status(404).sendFile(req.app.basePathM + "/routes/404_not_found.jpg");
                });
                const path = Path.resolve(__dirname, requestedURI.includes("/") ? requestedURI.split("/").pop().includes("?") ? requestedURI.split("/").pop().split("?")[0] : requestedURI.split("/").pop() : requestedURI);
                const writer = fs.createWriteStream(path);
                let getImage = await Axios({
                    url: configObj.basePath[configObj.basePath.length - 1] == '/' ? configObj.basePath + requestedURI : configObj.basePath + "/" + requestedURI,
                    method: 'GET',
                    responseType: 'stream'
                })
                // getImage.on('response', (response) => {
                getImage.data.pipe(writer)
                    .on('close', async (pathd) => {
                        console.log("done", pathd);
                        var s = sharp(path);

                        // if (s) {
                        console.log("sharping");

                        // await s.median();
                        // await s.withMetadata();
                        s.metadata().then((metadata) => {
                            trObj = {};
                            if (transformationObj.w) {
                                console.log("width ; ", transformationObj.w);
                                metadata.width < 1 * transformationObj.w
                                    ? trObj.width = metadata.width
                                    : trObj.width = transformationObj.w * 1
                            }
                            if (transformationObj.h) {
                                console.log("height ; ", transformationObj.h);
                                metadata.height < 1 * transformationObj.h
                                    ? trObj.height = metadata.height
                                    : trObj.height = transformationObj.h * 1
                            }
                            if (Object.keys(trObj).length > 0)
                                s = s.resize(trObj);
                            if (transformationObj.format) {
                                console.log("GETTING FORMAT", req.query.format, typeof req.query.format);
                                // s = s["jpeg"]({
                                //     quantisationTable: 8,
                                //     format: "jpeg",
                                //     overshootDeringing: true,
                                //     optimiseScans: true,
                                //     trellisQuantisation: true,
                                //     quality: 100,
                                //     progressive: true,
                                //     lossless: false,
                                //     chromaSubsampling: "4:2:0",
                                //     reductionEffort: 6,
                                //     kernel: 'cubic'
                                // });
                                s = s.toFormat(req.query.format);
                            } else {
                                s = s["webp"]({
                                    quantisationTable: 8,
                                    overshootDeringing: true,
                                    optimiseScans: true,
                                    trellisQuantisation: true,
                                    quality: 100,
                                    progressive: true,
                                    lossless: true,
                                    chromaSubsampling: "4:2:0",
                                    reductionEffort: 6,
                                    kernel: 'cubic'
                                });
                            }

                            s.toBuffer().then(async data => {
                                // let saveDir = Path.resolve(__dirname, "deliverable" + requestedURI.includes("/") ? requestedURI.split("/").pop() : requestedURI);
                                // await fsp.writeFile(saveDir, data);
                                res.contentType("image/" + req.query.format ? req.query.format : "webp")
                                res.end(data);
                                if (fs.existsSync(path)) {
                                    console.log("UNLINKING bruh");
                                    fs.unlinkSync(path);
                                }
                            });
                        });

                        // }
                    })
                // })

                // console.log("SAVED IMG : : ", path);

            }
        }
    }
}
