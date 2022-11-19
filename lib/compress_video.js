var exec = require(__dirname + "/execCommand");
const ffmpeg = require('fluent-ffmpeg');


async function compress_vid(file, outFile) {
    return new Promise(async (res, rej) => {
        var proc = new ffmpeg();
        proc.addInput(file)
            .on('start', function (ffmpegCommand) {
                /// log something maybe
                console.log('progress', 'Spawned Ffmpeg with command: ' + ffmpegCommand);
            })
            .on('progress', async function (info) {
                console.log('progress', info);
                // do stuff with progress data if you want
            })
            .on('end', async function () {
                /// encoding is complete, so callback or move on at this point
                console.log('complete');
                resolve(true)

                // let transcodeResp = await startTranscoding(tempFileName, targetdir, tdir, types, enhance, layered, othersObj.rotation, transcodingType, filename, compressionLevel, defaultConf, newFrameRate, fileInfo);
                // console.log("transcodeResp : ", transcodeResp);
                // if (transcodeResp) resolve(fileInfo);
                // else resolve(false);
            })
            .on('error', function (error) {
                /// error handling
                console.log(error, "<<")
                resolve(false);
            })
            // .addInputOptions(['-hide_banner'])
            .outputOptions(`-c:v libx265 -crf 28`.split(" "))
            .output(outFile)
            .run();
        // await exec("ffmpeg -i " + file + " -c:v libx265 -crf 28 " + outFile);
    })
}

compress_vid('/home/agam/Downloads/movie/avenger.mkv', '/home/agam/Downloads/movie/avenger_compressed.mkv')