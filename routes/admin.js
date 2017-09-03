var express = require('express');
var ctrlUser = require('../controllers/user_ctrl');
var ctrlMoney = require('../controllers/money_ctrl');
var storage = require('node-persist');
var router = express.Router();

router.use('/',function(req,res,next){
    if(res.locals.role < ctrlUser.role("admin"))
        res.render('mess',{text:"Accès refusé",link:"/user",linkName:"la page de login"});
    else
        next();
});

router.get('/',function(req,res,next){
    storage.initSync();
    var validity = storage.getItemSync('productValidity');
    var spePage = storage.getItemSync('isSpePageAvailable');
    var msp = storage.getItemSync('membershipPrice');

    ctrlUser.getAmicalisteById(2).then(usr=>{
        res.render("admin/admin",{validity:validity,spePage:spePage,msp:msp/100,solde:usr.solde/100});
    });
});


router.post('/promote',function(req,res,next){
    var id = req.body.id;
    var role = req.body.role;

    ctrlUser.updateAmById(id,{role : role}).then(usr =>{
        if(!usr)
            res.send("id not found");
        else
            res.send("done !");
    }).catch((err)=>{
        res.send("something went wrong : "+ err + err.stack);
    });
});

router.post('/convert',function(req,res,next){
    var afRole = req.body.affectedRole;
    var role = req.body.role;

    ctrlUser.convertAm(afRole,role).then(result =>{
        res.send(result + " users affected");
    }).catch((err)=>{
        res.send("something went wrong : "+ err + err.stack);
    });
});

router.post('/refund',function(req,res,next){
    var id = req.body.id;
    var amount = req.body.amount;

    ctrlMoney.transfertMoney(1,id,amount*100).then(result =>{
        if(result != "ok")
            res.send("Something wasn't right : " + result);
        else
            res.send("done !");
    }).catch((err)=>{
        res.send("something went wrong : "+ err + err.stack);
    });
});
router.post('/changeMoney',function(req,res,next){
    var amount = req.body.amount;

    ctrlMoney.changeMoneyById(1,amount).then(result =>{
        if(result != "ok")
            res.send("Something wasn't right : " + result);
        else
            res.send("done !");
    }).catch((err)=>{
        res.send("something went wrong : "+ err + err.stack);
    });
});

router.post('/changeValidity',function(req,res,next){
    try {
        var val = JSON.parse(req.body.val);

        storage.initSync();
        storage.setItemSync('productValidity',val);
        res.send("done !")
    } catch (e) {
        res.send(e +" \n" +e.stack);
    }
});

router.post('/changeMembershipPrice',function(req,res,next){
    try {
        var val = JSON.parse(req.body.val);

        storage.initSync();
        storage.setItemSync('membershipPrice',val*100);
        res.send("done !")
    } catch (e) {
        res.send(e +" \n" +e.stack);
    }
});

router.post('/displaySpePage',function(req,res,next){
    try {
        storage.initSync();
        var spePage= storage.getItemSync('isSpePageAvailable');
        storage.setItemSync('isSpePageAvailable',!spePage);
        spePage= storage.getItemSync('isSpePageAvailable');
        res.send("The page is now : "+ spePage );
    } catch (e) {
        res.send("Something went wrong" + e);
    }

});

module.exports = router;
