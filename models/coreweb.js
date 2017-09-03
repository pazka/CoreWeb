var vente = require('../models/vente');
var basket = require('../models/basket');
var amicaliste = require('../models/amicaliste');
var product = require('../models/product');
var transac = require('../models/transac');
var stockrecord = require('../models/stockrecord');
var utils = require('../utilities/utilities');


transac.model.belongsTo(amicaliste.model,{as : "ase" , foreignKey:"idSender", targetKey:"idAm"});
transac.model.belongsTo(amicaliste.model,{as : "are" , foreignKey:"idReceiver", targetKey:"idAm"});
vente.model.hasOne(product.model,{ as:'prod',foreignKey:"idProd",targetKey:"idProd"});
product.model.belongsTo(vente.model,{ as:'prod',foreignKey:"idProd",targetKey:"idProd"});
//target is the key in the source db and foreign is the one in the other db
basket.model.hasMany(vente.model,{ as:'vente',foreignKey:"idBask",targetKey:"idBask"});
amicaliste.model.hasMany(basket.model,{foreignKey:"idAm", targetKey:"idAm"});
//noNeed to put has many with amicaliste belongstoput assocKey in the source so in vente and Transac
product.model.hasMany(stockrecord.model,{foreignKey:"idProd", targetKey:"idProd"})
var bdd = {};

bdd.ve = vente;
bdd.am = amicaliste;
bdd.pr = product;
bdd.tr = transac;
bdd.ba = basket;
bdd.sr = stockrecord;

/*console.log("BDD : \n AMI :\n" + utils.printObject(amicaliste.model.rawAttributes)
+ "\n PRO : \n" + utils.printObject(product.model.rawAttributes)
+ "\n TRA : \n" + utils.printObject(transac.model.rawAttributes)
+ "\n VEN : \n" + utils.printObject(vente.model.rawAttributes)
+ "\n BAS : \n" + utils.printObject(basket.model.rawAttributes)
+ "\n STR : \n" + utils.printObject(stockrecord.model.rawAttributes)
);*/

module.exports = bdd;
