var sequelize = require('../models/bdd');

var basket = sequelize.define('basket', {
    idBask     : { type: sequelize.mod.INTEGER, allowNull: false,primaryKey: true, autoIncrement: true},
    idAm       : { type: sequelize.mod.INTEGER, allowNull: true},
    prixTot    : { type: sequelize.mod.INTEGER, allowNull: false},
    remarque   : { type: sequelize.mod.STRING, allowNull: true},
    validateAt : { type: sequelize.mod.DATE, allowNull: true},
    state      : { type: sequelize.mod.ENUM('lq_', 'vm_','vmp', 'lqp','can'), allowNull: false}, //lq = liquide not payed, vmp = virtual moneypayed, lqp =lquide payed
    createdAt  : { type: sequelize.mod.DATE, allowNull: false},
    updatedAt  : { type: sequelize.mod.DATE, allowNull: false}
});

var Basket = {model : basket};

Basket.createBasket = function (idAm,remarque,state,date){

    return basket.create({
        idAm       :idAm      ,
        remarque   :remarque  ,
        prixTot    :0         ,
        state      :state     ,
        createdAt  :date      ,
        updatedAt  :date      ,
    fields : ['idBask','idAm','remarque','state','createdAt','updatedAt']});
};

Basket.updateBask  = function(id,values,fields){

    basket.findById(id).then(function(bask){
        bask.update(values,{fields : fields});
    });
};

Basket.updateState = function(id,state){
    return basket.updateBask(id,{state : CurState},['state']);
};

Basket.updatePriceById = function(id,price){
    return basket.findById(id).then((bask) => {
        return bask.increment({prixTot : price});
    });
};

Basket.updatePriceByInstance = function(inst,price){
    return inst.increment({prixTot : price});
};

Basket.validateBask  = function(id,date){
    //if already validate return error
    //else validate
    return basket.findById(id).then((bask) => {
        if(!bask)
            return "No basket at this id : "+id;

        if(bask.state.charAt(2) != '_')
            return "Already validated";

        return bask.update({state : bask.state.replace("_","p"),validateAt : date},['state','validateAt']).then((bask) => {
            return "successfuly validated basket";
        });
    });
};

Basket.validateBaskByInst  = function(inst,date){
    //if already validate return error
    //else validate
    return inst.update({state : bask.state.replace("_","p"),validateAt : date},['state','validateAt']).then((bask) => {
        return "successfuly validated basket";
    }).catch(err=>{
        return "something went wrong" + err;
    });
};

Basket.deleteBaskById = function(id){
    return basket.destroy({where:{idBask:id}});
}

Basket.getBaskByParam = function(param){
    return basket.findAll({where:param});
}
Basket.getBaskById = function(id){
    return basket.findById(id);
}

Basket.getUnvalBask = function(){
    return sequelize.query("SELECT `basket`.`idBask`, `basket`.`idAm`, `basket`.`state`,`basket`.`prixTot`,`basket`.`remarque`, `basket`.`createdAt`, `vente`.`idVe` AS `vente.idVe`, `vente`.`qt` AS `vente.qt`, `vente`.`idBask` AS `vente.idBask`, `vente`.`prixVe` AS `vente.prixVe`, `vente`.`idProd` AS `vente.idProd`, `vente`.`createdAt` AS `vente.createdAt`, `vente.prod`.`nom` AS `vente.prod.nom`, `vente.prod`.`idProd` AS `vente.prod.idProd`, `vente.prod`.`cat` AS `vente.prod.cat` FROM `baskets` AS `basket` LEFT OUTER JOIN `ventes` AS `vente` ON `basket`.`idBask` = `vente`.`idBask` LEFT OUTER JOIN `produits` AS `vente.prod` ON `vente`.`idProd` = `vente.prod`.`idProd` WHERE (`basket`.`state` = 'vm_' OR `basket`.`state` = 'lq_') ORDER BY `basket`.`idBask` DESC;",{type : sequelize.QueryTypes.SELECT});
}


module.exports = Basket;
