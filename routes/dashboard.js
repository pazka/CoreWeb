var express = require('express');
var userCtrl = require('../controllers/user_ctrl');
var moneyCtrl = require('../controllers/money_ctrl');
var basketCtrl = require('../controllers/basket_ctrl');
var utils = require('../utilities/utilities');
var storage = require('node-persist');
var router = express.Router();

router.use('/',function(req,res,next){
    if(userCtrl.checkSession(req))
        next();
    else
        /*userCtrl.cheatSession();
        next();*/
        res.redirect('/user/notsignedin');
});

router.get('/', function(req, res, next) {
        userCtrl.updateSession(req);
        storage.initSync();
        var infos = userCtrl.getUserInfos(req);
        infos.newshtml = storage.getItemSync('news');

        res.render('user/dashboard/dashboard',infos);
});
router.get('/solde', function(req, res, next) {
        userCtrl.getAmicalisteById(userCtrl.getUserInfos(req).id).then(usr=>{
            res.send({solde : usr.solde});
        });
});

router.get('/addMoney', function(req, res, next) {
        res.render('user/dashboard/addMoney');
});

router.get('/giveMoney', function(req, res, next) {
        res.render('user/dashboard/giveMoney');
});

router.post('/giveMoney', function(req, res, next) {
    userCtrl.getAmicalisteById(userCtrl.getUserInfos(req).id).then((user)=>{//SUCCESS
        if(utils.encrypt(JSON.stringify(req.body.password)) == user.psw){
            moneyCtrl.transfertMoney(userCtrl.getUserInfos(req).id,req.body.idToGive,req.body.amount*100).then((result) =>{
                if(result == "ok")
                    res.render('mess',{text:"Envoi effectué !",link:"/user/dashboard",linkName:"mon dashboard."});
                else
                    res.render('user/dashboard/giveMoney',{err : result});
            }).catch((result)=>{
                res.render('user/dashboard/giveMoney',{err : result + result.stack});
            });
        }else{
            res.render('user/dashboard/giveMoney',{err : "Bad password"});
        }
    });
});

router.get('/history', function(req, res, next) {
        moneyCtrl.getAllTrans(userCtrl.getUserInfos(req).id).then((trans) =>{
            basketCtrl.getSalesByIdAmRaw(userCtrl.getUserInfos(req).id).then((sale) =>{
                res.render('user/dashboard/history',
                {allTrans : trans,
                you : userCtrl.getUserInfos(req).id,
                allSales : sale});
            });

        }).error((error) => {
            res.render('user/dashboard/history',{err: "something went wrong :\n" + error.stack,allTrans : [],allSales : []});
        });

});

module.exports = router;
