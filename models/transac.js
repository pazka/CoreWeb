var sequelize = require('../models/bdd');
var amicaliste = require('../models/amicaliste');

var Transac = sequelize.define('transactions', {
    idSender     : { type: sequelize.mod.INTEGER, allowNull: false,primaryKey: true},
    idReceiver   : { type: sequelize.mod.INTEGER, allowNull: false,primaryKey: true},
    amount       : { type: sequelize.mod.INTEGER, allowNull: false},
    createdAt    : { type: sequelize.mod.DATE, allowNull: false,primaryKey: true},
    updatedAt  : { type: sequelize.mod.DATE, allowNull: false}
});

var transac = {model : Transac};

transac.createTrans  = function (idSe,idRe,amount,date){

    return Transac.create({
        idSender     : idSe         ,
        idReceiver   : idRe         ,
        amount       : amount       ,
        createdAt    : date         ,
        updatedAt    : date
    });
};

transac.getTransaction = function(_id){
    return Transac.findAll({
        include:[{
            model : amicaliste.model,
            as : 'ase' ,
            attributes : ['nom','idAm'],
        },{
            model : amicaliste.model,
            as : 'are' ,
            attributes : ['nom','idAm'],
        }],
        attributes: ['idSender', 'idReceiver','amount','createdAt'],
        order: sequelize.col('createdAt'),
        where : {$or : [{idSender : _id},{idReceiver : _id}]}
    }).then(res => {
        return res.reverse();
    });
}

module.exports = transac;
