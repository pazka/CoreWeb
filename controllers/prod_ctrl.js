var db = require('../models/coreweb');
var utils = require('../utilities/utilities');
var ctrlRec = require('../controllers/record_ctrl');
var storage = require('node-persist');

var Prod = {};

Prod.getAllProd = function(){
    return db.pr.getProductParam({});
}

Prod.getAllDisplayableProd = function(){
    return db.pr.getProductParam({$or:[{hide:false},{hide:null}] });
}

Prod.segmentProdByCat = function(allProd){
    var segArray = {length : allProd.length,allCat:Prod.getCats()};

    segArray.allCat.forEach((cat) => {
        var arr = [];
        allProd.forEach((prod) => {
            if(prod.cat == cat)
                arr.push(prod);
        });

        segArray[cat] = arr;
    });
    return segArray;
}

Prod.getAllAvailableProd = function(){
    return db.pr.getProductParam({qtVirt : {$gt : 0}, $or:[{hide:false},{hide:null}] });
}

Prod.getAllPhysicProd = function(){
    return db.pr.getProductParam({qtReal : {$gt : 0}, $or:[{hide:false},{hide:null}] });
}

Prod.incrementProd = function(idProd,value){
    return db.pr.incrementProd(idProd,value).then(res=>{
        ctrlRec.createRecord(idProd,Date.now());
        return res;
    });
}

Prod.incrementQtrProd = function(idProd,value){
    return db.pr.incrQtrProd(idProd,value).then(res=>{
        ctrlRec.createRecord(idProd,Date.now());
        return res;
    });
}

Prod.reserveProd = function(idProd,value){
    return db.pr.reserveProd(idProd,value);
}

Prod.createProd = function(prix,nom,desc,qt,cat,img){
    return db.pr.createProduct(prix,nom,desc,qt,cat,img,Date.now()).then(res => {
        if(res.err)
            return res.text;

        ctrlRec.createRecord(res.id,Date.now());
        return "Product created, idProd = "+res.idProd;
    });
}

Prod.updateProd = function(id,value){
    return db.pr.updateProduct(id,value).then(res=>{
        return res;
    });
}

Prod.changePrice = function(id,price){
    return db.pr.updateProduct(id,{prix : price},['prix']);
}

Prod.getCats = function(){
    return  [ 'drink', 'food','event','other'];
}

Prod.getAvailableCats = function(){
    storage.initSync();
    var validity = storage.getItemSync('productValidity');
    if(validity == undefined)
        return [];

    var result = [];

    var isValid = function(cat){
        res = false;
        validity[cat].forEach(function(hor){
            if(!res){
                var start = new Date();
                start.setHours(parseInt(hor.start.h));
                start.setMinutes(parseInt(hor.start.m));
                var end = new Date();
                end.setHours(parseInt(hor.end.h));
                end.setMinutes(parseInt(hor.end.m));

                if(Date.now() >= start && Date.now() <= end){
                    res = true;
                }
            }
        });
        return res;
    }

    Prod.getCats().forEach(cat=>{
        if(isValid(cat))
            result.push(cat);
    });

    return result;
}

module.exports = Prod;
