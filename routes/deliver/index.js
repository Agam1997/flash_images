var express = require("express");
var router = express.Router();

var get = require('./get');
// var post = require('./post');
// var put = require('./put');


//all GET requests here : : 
//get should have user details not get analytics or something
// router.get("/:userId", get.getTotalPorL); //calculate the profit or loss user is going to make on a stock owned by user

//get ends
router.get(["/:configId", "/:configId/*"], get.transform);
//all post requests here : :
// router.post("/", post.compress);
// router.post("/login", post.login);

//put requests
// router.put("/:userId/wallet", put.updateWallet);


module.exports = router;