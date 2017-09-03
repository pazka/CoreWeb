var sequelize = require('../models/bdd');
var product = require('../models/product');
var basket = require('../models/basket');
var amicaliste = require('../models/amicaliste');
var Sales = sequelize.define('vente', {
    idVe       : { type: sequelize.mod.INTEGER, allowNull: false,primaryKey: true, autoIncrement: true},
    idBask     : { type: sequelize.mod.INTEGER, allowNull: false},
    idProd     : { type: sequelize.mod.INTEGER, allowNull: false},
    qt         : { type: sequelize.mod.INTEGER, allowNull: false},
    reduc      : { type: sequelize.mod.FLOAT, allowNull: true},
    prixVe     : { type: sequelize.mod.INTEGER, allowNull: false},
    createdAt  : { type: sequelize.mod.DATE, allowNull: false},
    updatedAt  : { type: sequelize.mod.DATE, allowNull: false}
});

var Vente = {model : Sales};

Vente.createSale = function (idProd,idBasket,prix,qt,reduc,date){
    var calculatedPrice = qt * prix * (1-(reduc/100));
    return Sales.create({
        idBask     : idBasket       ,
        idProd     : idProd         ,
        qt         : qt             ,
        reduc      : reduc          ,
        prixVe     : calculatedPrice,
        createdAt  : date           ,
        updatedAt  : date           ,
    },{fields : ['idBask','idProd','qt','reduc','prixVe','createdAt']})
    .error((err) => {return "Couldn't create Sale, error when searching for product\n"+err;});
};

//deprecated but still used somewhere
Vente.getSaleByParam = function(param,callback,callfail){
    Sales.findAll({attributes: ['idProd','qt','remarque','createdAt'], order: sequelize.col('createdAt') ,param})
    .then(function(result){callback(result);})
    .catch(function(error){callfail(error);});
}

//better
Vente.getSaleByParamBetter = function(param){
    return Sales.findAll({attributes: ['idProd','qt','createdAt'], order: sequelize.col('createdAt') ,where:param});
}

Vente.getPriceById = function(idVe,callback,callfail){
    Sales.findById(idVe).then((vente) => {
        return vente.prixVe;
    });
}

Vente.updateSale  = function(id,values,fields,callback,callfail){
    callfail = callfail || logError;
    callback = callback || function(value){};

    Sales.findById(id).then(function(vente){
            vente.update(values,{fields : fields})
            .then(function(vente){callback(vente);},function(error){callfail(error);});
    },function(err){return "ERROR : something went wrong " + err + "\n" + err.stack}); // return a promise
};

Vente.deleteSaleById = function(idVe){
    return Sales.destroy({where : {idVe : idVe}});
}


Vente.deleteVenteByIdBask = function(idBask){
    return Sales.destroy({where:{idBask:idBask}});
}

Vente.deleteVenteById = function(id){
    return Sales.destroy({where:{idVe:id}});
}

///obselete
Vente.getSaleByIdAm = function(_idAm){
    return basket.model.findAll({
        include:[{
            include:[{
                model : product.model,
                as : "prod",
                attributes : ['nom','idProd']
            }],
            model : Vente.model,
            as : "vente",
            attributes : ['qt','idBask','prixVe','idProd','createdAt'],
            order: sequelize.col('createdAt')
        }],
        as :"basket",
        attributes: ['idBask','idAm'] ,
        where:{
            idAm : _idAm
        }
    });
}

Vente.getSaleByIdAmRaw = function(_idAm){
    return sequelize.query("SELECT `basket`.`idbask`,       `basket`.`idam`,`basket`.`state` AS `basket.state`,       `vente`.`idve`        AS `vente.idVe`,       `vente`.`qt`          AS `vente.qt`,       `vente`.`idbask`      AS `vente.idBask`,       `vente`.`prixve`      AS `vente.prixVe`,       `vente`.`idprod`      AS `vente.idProd`,       `vente`.`createdat`   AS `vente.createdAt`,       `vente.prod`.`nom`    AS `vente.prod.nom`,       `vente.prod`.`cat`    AS `vente.prod.cat`,       `vente.prod`.`idprod` AS `vente.prod.idProd`FROM   `baskets` AS `basket`       LEFT OUTER JOIN `ventes` AS `vente`                    ON `basket`.`idbask` = `vente`.`idbask`       LEFT OUTER JOIN `produits` AS `vente.prod`                    ON `vente`.`idprod` = `vente.prod`.`idprod`WHERE  `basket`.`idam` = "+ _idAm +"  AND (`basket`.`state` = 'vmp' OR `basket`.`state` = 'lqp') ORDER BY `vente`.`idBask` DESC ;",{type : sequelize.QueryTypes.SELECT});
}

module.exports = Vente;
