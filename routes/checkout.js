var express = require('express');
var ctrlBask = require('../controllers/basket_ctrl');
var ctrlProd = require('../controllers/prod_ctrl');
var ctrlUser = require('../controllers/user_ctrl');
var ctrlMoney = require('../controllers/money_ctrl');
var storage = require('node-persist');
var router = express.Router();

router.use('/',function(req,res,next){
    if(res.locals.role < ctrlUser.role("staff"))
        res.render('mess',{text:"Accès refusé",link:"/user",linkName:"la page de login"});
    else
        next();
});

router.get('/',function(req,res,next){
    var allDatas = [];
    allDatas[0] = ctrlProd.getAllDisplayableProd().then((allProds)=>{
        return ctrlProd.segmentProdByCat(allProds);
    }).catch((reason)=>{
        return reason;
    });
    allDatas[1] = ctrlBask.getUnvalBask().catch((reason)=>{
        return reason;
    });

    Promise.all(allDatas).then(results => {
        res.render("checkout/order",{
            allProd : results[0],
            allBasks : results[1]//TODO error while getting all baskets
        });
    });
});

router.get('/getSegProds',function(req,res,next){
    ctrlProd.getAllDisplayableProd().then((arr)=>{
        arr = ctrlProd.segmentProdByCat(arr);
        res.send(JSON.stringify(arr));
    });
});

router.get('/getRawProds',function(req,res,next){
    ctrlProd.getAllDisplayableProd().then((arr)=>{
        //arr = ctrlProd.segmentProdByCat(arr);
        res.send(JSON.stringify(arr));
    });
});

router.get('/getProdsAndBasks',function(req,res,next){
    var reqs = [ctrlProd.getAllDisplayableProd(),ctrlBask.getUnvalBask()]
    Promise.all(reqs).then((arr)=>{
        //arr = ctrlProd.segmentProdByCat(arr);
        res.send(JSON.stringify({prod:arr[0],bask:arr[1]}));
    });
});

router.post('/getUser',function(req,res,next){
    ctrlUser.getAmicalisteById(req.body.id).then(usr =>{
        if(usr){
            usr.psw="hidden";
            res.send(usr);
        }
        else
            res.send("not found");
    }).catch(err=>{
        res.send("something went wrong : "+ err);
    })
});

router.post('/getUserName',function(req,res,next){
    ctrlUser.getAmicalisteByParam({$or: [{nom: req.body.name}, {prenom: req.body.name}]}).then(usr =>{
        if(usr.length != 0){
            usr.forEach((u)=>{u.psw = "hidden"});
            res.send(usr);
        }
        else
            res.send("not found");
    }).catch(err=>{
        res.send("something went wrong : "+ err.stack);
    })
});


router.post('/createAmicaliste',function(req,res,next){
    ctrlUser.addUser(req.body.name,req.body.firstname,"1234","1234").then((result)=>{
        if(result.stat == "ok"){
            res.send(JSON.stringify({text:"Inscription effectuée ! Id: #" + result.idAm,id:result.idAm})); //success
        }
        else
            res.send(result.text);
    }).catch((err) =>{
        res.send("something went wrong :\n" + err + err.stack);
    });
});

router.post('/execute',function(req,res,next){
    order = JSON.parse(req.body.order);
    //order is an object of type Order
    ctrlBask.verifyOrderNoRestriction(order,true).then((result) => {
       if(result.length == 0){
            ctrlBask.createBasket(order)
            .then((baskId)=>{
                return ctrlBask.validateBasket(baskId).then((mess) => {
                    res.send(JSON.stringify([{idProd:0,text:"Commande créée et validée: #"+ baskId}]));
                }).catch(err=>{
                    res.send(JSON.stringify([{idProd:0,text:"error : "+ err}]));
                });
            }).catch(err=>{
                res.send("error :\n " + err);
            });
        }
       else{
           res.send(JSON.stringify(result));
        }
    }).catch(err=>{
        res.send("error :\n " + err);
    });
});

router.post('/validateBasket', function(req, res, next) {
    ctrlBask.validateBasket(req.body.baskId).then((mess) => {
        res.send(mess);
    }).catch(err=>{
        res.send("error :\n " + err);
    });
});

router.post('/checkSale',function(req,res,next){
    sale = JSON.parse(req.body.sale);
    //sale is an object type {idProd, Qt}

    ctrlBask.isQtValid(sale.idProd,sale.qt).then((result) => {
       res.send(result);
   }).catch(err=>{
       res.send("error :\n " + err);
    });
});


router.post('/fillAccount', function(req, res, next) {
    var id = req.body.id;
    var amount = req.body.amount;

    ctrlMoney.transfertMoney(2,id,amount).then(result=>{
        if(result == "ok"){
            res.send("Transfert effectué ! : Core ->"+amount/100+"->#"+id);}
        else{
            res.send(result);
        }
    }).catch(err=>{
        res.send(err);
    });
});

router.post('/validateAmicaliste', function(req, res, next) {
    var id = req.body.id;

    storage.initSync();
    prix = storage.getItemSync('membershipPrice');
    ctrlMoney.changeMoneyById(2,prix);
    ctrlUser.upgradeUserToRegular(id).then((result)=>{
        res.send(result);
    }).catch(err=>{
            res.send("something went wrong :\n "+err+err.stack)
    });
});

router.post('/cancelBask', function(req, res, next) {
    console.log("gonna delete" + req.body.baskId);
    ctrlBask.deleteBask(req.body.baskId).then((mess) => {
        res.send(mess);
    });
});

module.exports = router;
