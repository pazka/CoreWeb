var express = require('express');
var ctrlUser = require('../controllers/user_ctrl');
var ctrlRec = require('../controllers/record_ctrl');
var storage = require('node-persist');
var router = express.Router();

router.use('/',function(req,res,next){
    if(res.locals.role < ctrlUser.role("staff"))
        res.render('mess',{text:"Accès refusé",link:"/user",linkName:"la page de login"});
    else
        next();
});

router.get('/',function(req,res,next){
    res.render('stats/stats');
});

router.get('/getrecords',function(req,res,next){
    ctrlRec.getRecordParam({}).then(recArr=>{
        res.send(JSON.stringify(recArr));
    }).catch(err=>{
        res.send(err);
    });
});

module.exports = router;
