var db = require('../models/coreweb');

var StockRecord = {};

StockRecord.createRecord = function (idProd,date){
    db.pr.getProductById(idProd).then(prod =>{
        if(prod)
            return db.sr.createRecord(idProd,prod.nom,prod.qtReal,date);
        return "product dosen't exist, id : " + id;
    }).catch(err=>{
        return "something went wrong : " + err
    });
}


StockRecord.getRecordParam = function (param){
    return db.sr.getRecordParam(param);
};

module.exports = StockRecord;
