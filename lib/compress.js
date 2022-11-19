// const compress_images = require("compress-images");
const sharp = require('sharp');
var fs = require("fs");
const fsp = fs.promises;
const { compress } = require('compress-images/promise');
var Image = require("../models/images");

//with enhance then compress 51.7%

const compressImages = async (folderName, bucketName) => {
    return new Promise(async (resolve, reject) => {
        var INPUT_path_to_your_images = __dirname + "/" + folderName + "/**/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}";

        let dir = folderName.split("/").pop();
        let compressedDir;

        if (dir == "normal")
            compressedDir = __dirname + "/" + folderName.split("/")[0] + "/compressed"
        else
            compressedDir = __dirname + "/" + folderName.split("/")[0] + "/e_compressed"

        if (!fs.existsSync(compressedDir))
            fs.mkdirSync(compressedDir);

        var OUTPUT_path = compressedDir + "/";

        const result = await compress({
            source: INPUT_path_to_your_images,
            destination: OUTPUT_path,
            enginesSetup: {
                jpg: { engine: 'mozjpeg', command: ['-quality', '70'] },
                png: { engine: 'pngquant', command: ['--quality=20-50', '-o'] },
                svg: { engine: "svgo", command: "--multipass" },
                gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] }
            }
        });

        if (result) {
            // console.log("RESULT : : : ", result);
            const { statistics, errors } = result;
            if (statistics && typeof statistics[0] != 'undefined') {
                console.log("LENGTH : : :", statistics[0], typeof statistics[0]);
                let count = 0;
                let totalCompression = 0;
                let eachCompression = 0;
                let total_size_in = 0;
                let total_size_output = 0;
                // statistics - all processed images list
                console.log("STATS : : ", statistics);
                for (var i = 0; i < statistics.length; i++) {
                    count += 1
                    eachCompression += statistics[i].percent;
                    total_size_output += statistics[i].size_output;
                    total_size_in += statistics[i].size_in;

                }
                let average = eachCompression / count
                totalCompression = ((total_size_in - total_size_output) / total_size_in) * 100
                console.log("FINAL TOTAL COMPRESSION : : : ", totalCompression);
                console.log("AVERAGE COMPRESSION PER FILE : : : ", average);
                //not working check this 
                // let saveImageData = await Image.updateMany({
                //     bucketName: bucketName
                // }, {
                //     $set: {
                //         compressedpath: compressedDir
                //     }
                // }, { upsert: true, new: true });
                // if (saveImageData) {
                    resolve({
                        "compressed": true,
                        "perFileAvgCompression": average.toFixed(3),
                        "totalCompression": totalCompression.toFixed(3),
                        "compressedDir": compressedDir 
                    });
                // }
            } else {
                console.log("SAME FILES IN COMMPRESSING DIR : : : ");
                resolve({
                    message: "no new files for compression found"
                })
            }
        }
    })
};

module.exports = compressImages;

// compressImages("enhanced");
// compress();