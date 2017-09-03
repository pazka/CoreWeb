var db = require('../models/coreweb');

Vente = {};

Vente.deleteVenteById = function(id){
    return
    db.ve.getSaleByParamBetter({idVe:id}).then((ve)=>{
        return db.pr.reserveProd(ve.idProd,ve.qt).then(prod =>{
            return "";
        }).then((res) =>{
            return db.ve.deleteSaleById(id).then(() =>{
                return res+""; //BEST/NORMAL CASE
            }).catch(err =>{
                return err.stack;
            });
        });
    }).catch(err =>{
        return err.stack;
    });
}

Vente.deleteVenteByInst = function(inst){
    return db.pr.reserveProd(inst.idProd,inst.qt).then(prod =>{
        return "";
    }).then((res) =>{
        return db.ve.deleteSaleById(inst.idVe).then(() =>{
            return res+""; //BEST/NORMAL CASE
        }).catch(err =>{
            return err.stack;
        });
    });
}

module.exports = Vente;
