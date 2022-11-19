const sharp = require('sharp');
var fs = require("fs");
const fsp = fs.promises;
const path = require('path');

const enhanceImages = async (folderName) => {
    return new Promise(async (resolve, reject) => {


        //input filename carefully here.
        const directoryPath = path.join(__dirname, folderName);
        //passsing directoryPath and callback function
        fs.readdir(directoryPath, async function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }
            //listing all files using forEach
            // files.forEach(async function (file) {
            let promiseArr = [];
            for (var i = 0; i < files.length; i++) {
                console.log("pushing to promise : : ", files[i].split("/").pop());
                promiseArr.push(doEnhance(files[i].split("/").pop(), folderName));

                if (promiseArr.length > 5) {
                    console.log("INSIDE > 5");
                    await Promise.all(promiseArr).then((resp) => {
                        console.log("RESOLVING AFTER 5 and doing next responses : : : ", resp);
                        promiseArr = [];
                    });
                }
            }
            if (promiseArr.length > 0) {
                await Promise.all(promiseArr).then((resp) => {
                    console.log("\nDONE ALL RESOLVE TRUE : : remaining resp : : ", resp);
                });
            }

            resolve(true)
            // });
        });

    });
}

async function doEnhance(file, folderName) {
    return new Promise(async (resolve, reject) => {
        let enhanceDir = __dirname + '/' + folderName.split("/")[0] + "/enhanced";
        if (!fs.existsSync(enhanceDir))
            fs.mkdirSync(enhanceDir)
        var enhance = true;
        var sharpen = true;
        var gamma = false;
        let dataToWrite;
        // Do whatever you want to do with the file

        let newFileName = file //files[i].split("/").pop(); 
        if (newFileName.includes(".jpg") || newFileName.includes(".JPG") || newFileName.includes(".png") || newFileName.includes(".PNG")) {
            // let progress = (((i + 1) / len) * 100).toFixed(2)
            // console.log("progress : : ", progress, "%");
            // console.log(newFileName);
            // let s = await sharp(__dirname + "/uncompressed/babes/" + newFileName).sharpen(0.6, 0.5, 0.1).modulate({
            //     brightness: 1,
            //     // saturation: 1.2,
            //   }).median().gamma(2,2.05).withMetadata().toBuffer();
            var stats = fs.statSync(__dirname + "/" + folderName + "/" + newFileName);
            console.log('File Size in Bytes:- ' + stats.size);
            if ((stats.size / 1000) < 200) {//if  file size is less than 500KB
                //just copy file to /enhanced folder
                //check file size, if file size less than 500KB dont do enhancement this is called smart enhancement.
                console.log("SKIPPING file from enhancement : : : ", newFileName);
                await fs.copyFileSync(__dirname + "/" + folderName + "/" + newFileName, enhanceDir + "/" + newFileName);
                resolve(true);
            } else {
                var s = await sharp(__dirname + "/" + folderName + "/" + newFileName);

                if (s) {
                    // await s.withMetadata();
                    await s.median();
                    await s.withMetadata();
                    if (sharpen)
                        await s.sharpen(1.05, 1.05, 1);

                    if (enhance)
                        await s.modulate({
                            brightness: 1,
                            saturation: 1.2,
                        });

                    if (gamma)
                        await s.gamma(2, 2);

                    dataToWrite = await s.toBuffer();

                    await fsp.writeFile(enhanceDir + "/" + newFileName, dataToWrite);

                    resolve(true);
                    console.log("WAITING DUE TO AWAIT ....");
                }
            }
        }
    })
}

// enhanceImages("/gaurav_test");
module.exports = enhanceImages;