var sequelize = require('../models/bdd');

var stock = sequelize.define('stockrecords', {
    idProd     : { type: sequelize.mod.INTEGER, allowNull: false,primaryKey: true},
    qt         : { type: sequelize.mod.INTEGER, allowNull: false},
    nom        : { type: sequelize.mod.STRING, allowNull: false},
    createdAt  : { type: sequelize.mod.DATE, allowNull: false,primaryKey: true},
    updatedAt  : { type: sequelize.mod.DATE, allowNull: false},
});

sr = {model : stock};

sr.createRecord = function (idProd,name,qt,date){
    return stock.create({
        idProd     : idProd,
        qt         : qt,
        nom        : name,
        createdAt  : date,
        updatedAt  : date
    }).catch((err) => {
        return {err : true,text:"someting went wrong while creating a product\n" + err.stack};
    });
};

sr.getRecordParam = function (param){
    return stock.findAll({where : param});
};

module.exports = sr;
