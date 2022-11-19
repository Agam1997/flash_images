var fs = require("fs");
const fsp = fs.promises;
// import waifu2x from "waifu2x";
// const waifu2x = require('waifu2x');
// const W2XCJS = require('waifu2x-node').W2XCJS
// const DEFAULT_MODELS_DIR = require('waifu2x-node').DEFAULT_MODELS_DIR
// const converter = new W2XCJS();
const Upscaler = require('upscaler').default
// const upscaleed = new Upscaler();
// import Upscaler from 'upscaler'
const sharp = require('sharp');
// import * as tf from '@tensorflow/tfjs-node'
const tf = require('@tensorflow/tfjs-node');
// const models = require('@upscalerjs');
// console.log("models", models);


const path = require('path');
// var fs = require("fs");
// const fsp = fs.promises;

// const err = converter.loadModels(DEFAULT_MODELS_DIR);

// if (!err) {

//     const conv_err = converter.convertFile(__dirname + "/uncompressed/enhanced/img4_enhanced.jpg", __dirname + "/uncompressed/img4_enhanced_UPSCALE.jpg");
//     if (!err) {
//         console.log('File converted successfully');
//     }
// }

const upscaleImageToUInt8Array = async (filename, upscaler) => {
    // const file = fs.readFileSync(filename)
    const image = tf.node.decodeImage(filename, 3)
    const options = { output: 'tensor', padding: 6 }
    const tensor = await upscaler.upscale(image, options)
    const upscaledImage = await tf.node.encodeJpeg(tensor)
    return upscaledImage
}

async function upscale() {
    const image = fs.readFileSync(__dirname + "/uncompressed/enhanced/img7_normal.jpg");
    const upscaleed = new Upscaler({
        model: "div2k/rdn-C3-D10-G64-G064-x2"
        // scale: 2
    });

    let resp = await upscaleImageToUInt8Array(image, upscaleed);

    if (resp) {
        console.log("IMAGE UPSCALED : : : ");
        fs.writeFileSync("img4_normal_upsclaed_ideao.jpg", resp)
    }

    // tf.tidy(async () => {
    //     const imageTensor = tf.node.decodeImage(image, 3)
    //     console.log(`Success: local file to a ${imageTensor.shape} tensor`)
    //     const upscaleed = new Upscaler({
    //         model: 'div2k-2x',
    //         scale: 2
    //     });

    //     const options = { output: 'tensor', patchSize: 64, padding: 6 };

    //     const tensor = await upscaleed.upscale(imageTensor, options)

    //     const upscaledImage = await tf.node.encodeJpeg(tensor);

    //     if (upscaledImage){
    //         console.log("IMAGE UPSCALED : : : ");
    //         fs.writeFileSync("img4_normal_upsclaed.jpg", f)
    //     }

    //     // upscaleed.upscale(imageTensor, {
    //     //     output: 'tensor',
    //     // }).then(upscaledImage => {
    //     //     // fsp.writeFile(__dirname + "/uncompressed/img4_enhanced_upscalerJs", s).then(async (data) => {
    //     //     // //             //do something after writing the file
    //     //     //         })
    //     //     tf.node.encodeJpeg(upscaledImage).then((f) => {
    //     //         2
    //     //         fs.writeFileSync("simple.jpg", f); 3
    //     //         console.log("Basic JPG 'simple.jpg' written");
    //     //     });
    //     //     console.log(upscaledImage); // base64 representation of image src
    //     // })

    //     const imageBWTensor = tf.node.decodeImage(image, 1)
    //     console.log(`Success: local file to a ${imageBWTensor.shape} tensor`)
    // })

    // let s = await sharp(__dirname + "/uncompressed/not_enhanced/img4_normal.jpg").resize(1000, 512, {
    //     kernel: sharp.kernel.lanczos2,
    //     fit: 'contain',
    //     // position: 'right top',
    //     background: { r: 255, g: 255, b: 255, alpha: 0.5 }
    //   }).toBuffer();

    // if(s){
    //     fsp.writeFile(__dirname + "/uncompressed/img4_enhanced_upscale_SHARP", s).then(async (data) => {
    //         //do something after writing the file
    //     })
    // }
}

upscale();
//add sharpening by sharp here
