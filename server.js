//hello world. start of my stock market personal project MEAN stack letsGo!

var createError = require('http-errors');
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
// var cors = require("cors")
var mongoose = require('mongoose');
// var auth = require("./lib/jwt");

var app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//connect to Db start
app["env"] = process.env.NODE_ENV || "prod"

if (app["env"] == "prod") {
    //code here for prod db connection
    console.log("here?");
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // reconnectInterval: 500, // Reconnect every 500ms
        // poolSize: 500,
        // bufferMaxEntries: 0,
        // connectTimeoutMS: 50000, // Give up initial connection after 10 seconds
        // socketTimeoutMS: 52000, // Close sockets after 45 seconds of inactivity
        // family: 4
    };

    mongoose.connect("mongodb+srv://admin-agam:qwerty123@cluster0.xbpx4.mongodb.net/flashImages?retryWrites=true&w=majority", options).then(() => {
        console.log("DB CONNECTION DONE : ");
    });


    const db = mongoose.connection;

    db.on('error', err => {
        console.log("CONNECTION ERROR IN MONGOOSE: : ", err);
        process.exit()
    });
} else {
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // reconnectInterval: 500, // Reconnect every 500ms
        // poolSize: 500,
        // bufferMaxEntries: 0,
        // connectTimeoutMS: 50000, // Give up initial connection after 10 seconds
        // socketTimeoutMS: 52000, // Close sockets after 45 seconds of inactivity
        // family: 4
    };

    mongoose.connect("mongodb+srv://admin-agam:qwerty123@cluster0.xbpx4.mongodb.net/flashImages?retryWrites=true&w=majority", options).then(() => {
        console.log("DB CONNECTION DONE : ");
    });


    const db = mongoose.connection;

    db.on('error', err => {
        console.log("CONNECTION ERROR IN MONGOOSE: : ", err);
        process.exit()
    });
};



//Db connection end

// app.use(cors());
//cors specfics
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, X-Content-Length, X-Chunks-Quantity, X-Content-Id, X-Chunk-Id, X-Content-Name, Accept, app-key, app-id, user-id, password");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});
//auth dont have to read token on every request
// app.use(auth.validate);

//routes start
app.use('/', require(__dirname + '/routes/index'));
app.use('/compress', require(__dirname + '/routes/compress/'));
app.use('/deliver', require(__dirname + "/routes/deliver/"));

//routes end

// catch 404 and forward to error handler timeTracks thumbnail
app.use(function (req, res, next) {
    console.log("error in found=====>", req._parsedUrl)
    next(createError(404));
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log("flashImages started : : started ...", PORT);
})

module.exports = app;