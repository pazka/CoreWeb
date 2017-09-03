var user_ctrl = require('../controllers/user_ctrl');
var vente_ctrl = require('../controllers/vente_ctrl');
var money_ctrl = require('../controllers/money_ctrl');
var prod_ctrl = require('../controllers/prod_ctrl');
var db = require('../models/coreweb');
var storage = require('node-persist');
var utils = require('../utilities/utilities');

var Bask = {};
const ARTICLE_LIMIT = 7;

Bask.getUnvalBask = function(){
    return db.ba.getUnvalBask().then((res)=>{
        //clustering the baskets, so that we have a list of sales
        res = JSON.stringify(res);
        res = JSON.parse(res);
        var result = [];
        var baskTmp;

        res.forEach((bask)=>{
            //init and new cluster of basks
            if(!baskTmp || baskTmp.idBask != bask.idBask){
                //not init case
                if(baskTmp)
                    result.push(baskTmp);

                baskTmp = bask;
                baskTmp.ventes = [];
            }

            var venteTmp = {};
            venteTmp.idVe = bask["vente.idVe"];
            venteTmp.qt = bask["vente.qt"];
            venteTmp.prixVe = bask["vente.prixVe"];
            venteTmp.idProd = bask["vente.idProd"];
            venteTmp.nom = bask["vente.prod.nom"];
            venteTmp.cat = bask["vente.prod.cat"];

            baskTmp.ventes.push(venteTmp);
        });

        if(baskTmp)
            result.push(baskTmp);

        return result;
    });
}

//this function dosen't verify if the order is correct
Bask.createBasket = function(order){
    firstProd = order.products[0];
    order.products.splice(order.products.indexOf(firstProd),1);
    if(order.remarque == undefined ||order.remarque == "NaN" || order.remarque == null){
        order.remarque = "";
    }

    return Bask.initWithSale(order.idAm,firstProd.idProd,order.remarque,order.state,Date.now(),firstProd.qt,firstProd.reduc).then((bask) => {
            var allCheck = [];
            order.products.forEach((elem) => {
                allCheck.push(Bask.addSale(bask.idBask,elem.idProd,elem.qt,elem.reduc,bask.createdAt)
                .then(() => {return ""})
                .catch(err => {return "\nerror : " + err;})
                );
            });// All reject or resolve values are going to be in the array

            return Promise.all(allCheck).then((result) => {
                var res = utils.cleanArray(result,["",null,"ok"]);
                if (res.length == 0){
                    return bask.idBask;
                }
                else{
                    return "error during the creation Bask, BaskId:"+bask.idBask+"\n" + res;
                }
            });
    });
}

Bask.initWithSale = function(b_idAm,v_idProd,b_remarque,b_state,date,v_qt,v_reduc){
    return db.ba.createBasket(b_idAm,b_remarque,b_state,date).then((createdBask) => {
        return Bask.addSale(createdBask.idBask,v_idProd,v_qt,v_reduc,date);
    });
};

Bask.addSale = function(idBask, idProd,qt,reduc,date){
    return db.ba.getBaskById(idBask).then((basket) =>{
        if(basket){
            if(basket.state.charAt(2) == 'p')
                callfail("basket is validated, can't change that");
            else {
                return db.pr.getProductById(idProd).then((prod) =>{
                    db.pr.reserveProdByInst(prod,-qt);

                    return db.ve.createSale(idProd,idBask,prod.prix,qt,reduc,date).then((vente) =>{
                        return db.ba.updatePriceById(vente.idBask,vente.prixVe*(1-vente.reduc/100));
                    });
                });
            }
        }
        else
            return "Couldn't find associated basket during creation of the sale";
    });
};

Bask.addArraySale = function(idBask, idProd,qt,reduc,date,callback,callfail){
    db.ve.createSale(idProd,idBask,qt,reduc,date,function(vente){
        db.ba.updatePriceById(vente.idBask,vente.prixVe,callback,callfail);
    },callfail);
};

Bask.getSalesByIdAm = function(_idAm){
    return db.ve.getSaleByIdAm(_idAm);
}
Bask.getSalesByIdAmRaw = function(_idAm){
    return db.ve.getSaleByIdAmRaw(_idAm).then((res) => {
        return res;
    });
}

Bask.validateBasket = function(idBask){
    return db.ba.getBaskById(idBask).then((bask) => {
        if(!bask)
            return "No basket at this id : "+id;

        if(bask.state.charAt(2) != '_')
            return "Already validated";

        if(bask.state == "vm_"){
            return money_ctrl.transfertMoney(bask.idAm,2,bask.prixTot).then((result)=>{
                return finalise(result);
            }).catch(err=>{
                return "something went wrong : \n"+err;
            });
        }else{
            return money_ctrl.changeMoneyById(2,bask.prixTot).then((result)=>{
                return finalise(result);
            }).catch(err=>{
                return "something went wrong : \n"+err;
            });
        }
    });

    function finalise(result){
        db.ve.getSaleByParamBetter({idBask : idBask}).then(allSales=>{
            allSales.forEach((s)=>{
                prod_ctrl.incrementQtrProd(s.idProd,-s.qt);
            });
        });
        return db.ba.validateBask(idBask,Date.now());
    }
}

//this function only delete unvalidated baskets and restore qtVirt not money
Bask.deleteBask = function(id){

    //need to regulate the qt of the prods first but only for un val sales
    // then to delete basket then sales

    return db.ba.getBaskById(id).then((bask)=>{
        if(!bask)
            return "basket not found at this id";

        if(bask.state != "lq_" && bask.state != "vm_")
            return "Basket is validated, cannot delete validated bask for history reason.";

        return db.ve.getSaleByParamBetter({idBask:id}).then((allFound) =>{
            ap = [];
            allFound.forEach((elem) =>{
                ap.push(vente_ctrl.deleteVenteByInst(elem));
            });

            Promise.all(ap).then((results) =>{
                results = utils.cleanArray(results,[""]);
                if(results.length != 0)
                    return "something went wrong with one of the products to update" + JSON.stringify(results);

                return db.ba.deleteBaskById(id);
            });
        });
    });
}

//this function return realQt and money to where it belong
Bask.deleteAccidentBask = function(id){
    //TODO This function
/*
    return db.ba.getBaskById(id).then((bask)=>{
        if(!bask)
            return "basket not found at this id";

        if(bask.state != "lq_" && bask.state != "vm_")
            return "Basket is validated, cannot delete validated bask for history reason.";

        return db.ve.getSaleByParamBetter({idBask:id}).then((allFound) =>{
            ap = [];
            allFound.forEach((elem) =>{
                ap.push(vente_ctrl.deleteVenteByInst(elem));
            });

            Promise.all(ap).then((results) =>{
                results = utils.cleanArray(results,[""]);
                if(results.length != 0)
                    return "something went wrong with one of the products to update" + JSON.stringify(results);

                return db.ba.deleteBaskById(id);
            });
        });
    });*/
}

Bask.verifyOrder = function(order){
    return new Promise((resolve,reject)=>{

        //check Qt
        var qtt=0;

        order.products.forEach((elem) => {
            qtt += elem.qt;
        });

        if(qtt>ARTICLE_LIMIT){
            resolve([{idProd:0,text:"Vous ne pouver pas réserver plus de "+ARTICLE_LIMIT+" articles à la fois"}]);
        }

        Bask.verifyOrderNoRestriction(order).then((res)=>{
            resolve(res);
        }).catch((err)=>{
            reject(err);
        });
    });
}

Bask.verifyOrderNoRestriction = function(order,reduc = false){
    var allCheck = [];
    var totPrice = 0;

    if(order.state=="vm_"){
        allCheck.push(db.pr.getProductParam().then(allProd=>{
            order.products.forEach((elem) => {
                allProd.forEach(pr=>{
                    if(pr.idProd == elem.idProd){
                        if(reduc)
                            totPrice += pr.prix * elem.qt * (1-elem.reduc/100);
                        else
                            totPrice += pr.prix * elem.qt;
                    }
                });
            });

            return db.am.getAmicalisteById(order.idAm).then(usr=>{
                if(!usr)
                    return {idProd:-1,text:"id not found"}
                else if(usr.solde >= totPrice)
                    return "ok";
                else
                    return {idProd:0,text:"Pas assez de boulasse (le compte : "+usr.solde/100+"cc, la commande : "+totPrice/100+"cc)"};
            }).catch(err=>{
                return {text:err};
            });
        }).catch(err=>{
            return {text:err};
        }));
    }
    //noidcheck

    //check stock
    order.products.forEach((elem) => {
        allCheck.push(isQtValid(elem.idProd,elem.qt).catch(
            err=>{
                return {idProd:-1,text:"coundn't verify sale " + elem};
        }));
    });// All reject or resolve values are going to be in the array

    return Promise.all(allCheck).then((result) => {
        return utils.cleanArray(result,["",null,"ok"]);
    });
}

/*return a promise
  isSaleValid take in account :
  QUANTITY
  DATE
  */
function isSaleValid(idProd,qt){
    return new Promise((resolve,reject) => {
        db.pr.model.findById(idProd).then((result) =>{
            if(result.qtVirt < qt)
                return resolve({idProd:result.idProd,text:result.nom + " : No enough product in stock"});

            if(isDateValidSync(result.cat))
                return resolve("ok");

            return resolve({idProd:result.idProd,text:result.nom + " : The product isn't available during this period of time."});
        }).catch((err) =>{
            reject("isSaleValid : something went wrong" + err.stack);
        });
    });
};

/* isDateValid take in account :
    THE DATE OF VALIDITY OF THE CATEGORY
    the async version is less effective than the sync version
*/
function isDateValid(cat){
    return storage.init({continuous : true}).then(function() {
        return storage.getItem('productValidity');
    }).then(function(validity){
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
    });
}

function isDateValidSync(cat){
    storage.initSync();

    var validity = storage.getItemSync('productValidity');

    var res = false;
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

function isQtValid(idProd,qt){
  return new Promise((resolve,reject) => {
      db.pr.model.findById(idProd).then((result) =>{
          if(result.qtVirt < qt){
              return resolve({idProd:result.idProd,text:result.nom + " : No enough product in stock"});
          }else{
              return resolve("ok");
          }
      }).catch((err) =>{
          reject("isQtValid : something went wrong" + err.stack);
      });
  });
};


module.exports = Bask;
