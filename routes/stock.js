var express = require('express');
var ctrl = require('../controllers/prod_ctrl');
var ctrlUser = require('../controllers/user_ctrl');
var router = express.Router();

router.use('/',function(req,res,next){
    if(res.locals.role < ctrlUser.role("staff"))
        res.render('mess',{text:"Accès refusé",link:"/user",linkName:"la page de login"});
    else
        next();
});

//R
router.get('/',function(req,res,next){
    ctrl.getAllDisplayableProd().then((allProd) =>{
        res.render('stock/stock',{allProd : ctrl.segmentProdByCat(allProd)});
    }).catch((err)=>{
        res.render('stock/stock',{allProd :[]});
    });
});

//C
router.post('/create',function(req,res,next){
    var preq = JSON.parse(req.body.param);

    ctrl.createProd(preq.prix*100,preq.nom,preq.desc,0,preq.cat,preq.img,preq.date).then((result) =>{
        res.send("created ! please reload \n" + JSON.stringify(result));
    }).catch(err=>{
        res.send("something went wrong" + err.stack);
    });
});

//U
//Never update the prod without incrementing !!
router.post('/update',function(req,res,next){
    var pchanges = JSON.parse(req.body.changes);
    var id = req.body.id;

    ctrl.updateProd(id,pchanges).then(result => {
        res.send("done");
    }).catch(err => {
        res.send("Something went wrong: \n" + err.stack)
    });
});

router.post('/changeQt',function(req,res,next){
    var id = req.body.id;
    var qt = req.body.qt;

    ctrl.incrementProd(id,qt).then((mess)=>{
        res.send(mess)
    }).catch(err => {
        res.send("Something went wrong\n" + err.stack)
    });
});
router.post('/changeQtVirt',function(req,res,next){
    var id = req.body.id;
    var qt = req.body.qt;

    ctrl.reserveProd(id,qt).then((mess)=>{
        res.send(mess)
    }).catch(err => {
        res.send("Something went wrong\n" + err.stack)
    });
});

//D
router.post('/softdelete',function(req,res,next){
    ctrl.updateProd(req.body.id,{qtReal : 0,qtVirt:0,hide:'true'}).then(result => {
        res.send("Product won't be displayed anymore");
    }).catch(err => {
        res.send("Something went wrong\n" + err.stack)
    });
});

//D
router.post('/softcreate',function(req,res,next){
    ctrl.updateProd(req.body.id,{hide:false}).then(result => {
        res.send("Product will now be displayed");
    }).catch(err => {
        res.send("Something went wrong\n" + err.stack)
    });
});

module.exports = router;
