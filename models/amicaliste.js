var sequelize = require('../models/bdd');
var Amicaliste = sequelize.define('amicaliste', {
    idAm       : { type: sequelize.mod.INTEGER, allowNull: false,primaryKey: true},
    psw        :  { type: sequelize.mod.STRING(500), allowNull: false},
    role       : { type: sequelize.mod.INTEGER, allowNull: false}, //use the controller to know the type for sure
    nom        : { type: sequelize.mod.STRING, allowNull: false},
    prenom     : { type: sequelize.mod.STRING, allowNull: true},
    solde      : { type: sequelize.mod.INTEGER, allowNull: false},
    remarque   : { type: sequelize.mod.STRING, allowNull: true},
    createdAt  : { type: sequelize.mod.DATE, allowNull: false},
    updatedAt  : { type: sequelize.mod.DATE, allowNull: false}
});


function logError(value){console.log("Error bd : Amicaliste : " + value + "\n " + value.stack);}

var Am = {model : Amicaliste};

Am.addAmicaliste  = function (idAm,psw,permission,nom,prenom,solde,remarque,date,callback,callfail){
    return Amicaliste.create({
                    idAm       : idAm,
                    psw        : psw,
                    role       : permission,
                    nom        : nom,
                    prenom     : prenom,
                    solde      : solde,
                    remarque   : remarque,
                    createdAt  : date,
                    updatedAt  : date
    });
};

//made because some other pages use the old deprecated function
Am.getAmicalisteById  = function(id){
    return Amicaliste.findById(id);
};


Am.getAmicalisteParam  = function(param){
    return Amicaliste.findAll({where:param});//error
};

//return a promise to do things
Am.updateAm  = function(id,values){
    return Amicaliste.findById(id).then(function(user){
        if (user)
            return user.update(values).then((am)=>{
                return "Changements enregistrés !";
            });
        else
            return "User not found with this id : " + id;
    }); // return a promise
};
Am.updateAmByInstance  = function(user,values){
    return user.update(values).then((am)=>{
        return "done";
    });
};

//return a promise to do things
Am.update  = function(values,param){
    return Amicaliste.update(values,param);
};

//return a promise to do things
Am.changeMoneyById = function(id,value){
    return Amicaliste.findById(id).then(function (user){
        if(!user){
            return "id not found";
        }
        return user.increment({solde : value});
    });
};
Am.changeMoneyByInst = function(inst,value){
    return inst.increment({solde : value});
};

module.exports = Am;
