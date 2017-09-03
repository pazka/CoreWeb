var express = require('express');
var router = express.Router();

router.use('setupPayment',function(req,res,next){
    res.send(90);
});

module.exports = router;
