var express = require("express");
var router = express.Router();

//get checker backend working or not
router.get("/", (req, res, next) => {
    res.send("wlcome to flash images")
});

module.exports = router;