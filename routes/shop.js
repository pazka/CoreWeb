var express = require('express');
var router = express.Router();
var ctrlBask = require('../controllers/basket_ctrl');
var ctrlProd = require('../controllers/prod_ctrl');
var ctrlUser = require('../controllers/user_ctrl');
var Order = require('../utilities/order');
var utils = require('../utilities/utilities');

const TIMETOWAIT = 5;
const ACTIONMAX = 2;

router.use('/',function(req,res,next){
    if(res.locals.role  < ctrlUser.role("regular"))
        res.render('mess',{text:"Accès refusé",link:"/user",linkName:"la page de login"});
    else
        next();
});

router.get('/', function(req, res, next) {
    res.redirect('/shop/shop');
});
router.get('/shop', function(req, res, next) {
    ctrlProd.getAllAvailableProd().then((result) =>{
        var allProd =  ctrlProd.segmentProdByCat(result);
        var acat = ctrlProd.getAvailableCats();
        //console.log(acat);
        res.render('shop/shop',{allProd : allProd, availableCat:acat});
    }).catch(error=>{
        res.render('shop/shop',{allProd : {allCat:[]},availableCat:[],err:error.stack})
    });
});

router.get('/mess', function(req, res, next) {
   res.render("mess",{text:req.query.text});
});

router.use('/api/check', function(req, res, next) {
    /*request must be a Command type
    */
    parsedReq = JSON.parse(req.body.order);
    var order = new Order(parsedReq.idAm,parsedReq.remarque,parsedReq.state,parsedReq.products);
    ctrlBask.verifyOrder(order).then((result) => {
            //res.render('shop/confirm',{listOfErrs:JSON.stringify(result)});
            res.send(JSON.stringify(result));
    });
});

router.post('/execute',function(req,res,next){
    parsedReq = JSON.parse(req.body.order);

    parsedReq.idAm = ctrlUser.getUserInfos(req).id;//verif to keep hacker from putting another id
    parsedReq.wreduc = 0; //to keep hacker from putting alotofmoneyinhere
    parsedReq.remarque = "#"+parsedReq.idAm+":"+parsedReq.remarque;


    if(parsedReq.remarque.length >= 500){
        res.send(JSON.stringify([{idProd:0,text:"Remarque trop grande"}]));
        return "nope";
    }

    utils.preventSpamAsync(req.ip,"shop",TIMETOWAIT,ACTIONMAX,()=>{
        return ctrlBask.verifyOrder(parsedReq).then(result => {
           if(result.length == 0){
               return ctrlBask.createBasket(parsedReq).then((idBask) => {
                   res.send(JSON.stringify([{idProd:0,text:"La commande est passé (N°"+idBask+")\n. Retenez son numéro et allez la chercher dans la demi-heure avant son annulation."}]));
                   return false;
               }).catch(error => {
                   res.send(JSON.stringify([{idProd:0,text:"une erreur est survenue durant la création de la commande.\n" + error}]));
                   return false;
                });
            }
           else{
               res.send(JSON.stringify(result));
               return false;
            }
        });
    },()=>{
        res.send(JSON.stringify([{idProd:0,text:"Vous ne pouvez passer que "+ACTIONMAX+" commandes toute les "+TIMETOWAIT+" minutes."}]));
    });
});


module.exports = router;
