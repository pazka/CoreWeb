var sequelize = require('../models/bdd');
var Products = sequelize.define('produits', {
    idProd     : { type: sequelize.mod.INTEGER, allowNull: false,primaryKey: true, autoIncrement: true},
    prix       : { type: sequelize.mod.INTEGER, allowNull: false},
    nom        : { type: sequelize.mod.STRING, allowNull: false},
    desc       : { type: sequelize.mod.STRING, allowNull: true},
    qtReal     : { type: sequelize.mod.INTEGER, allowNull: false},
    qtVirt     : { type: sequelize.mod.INTEGER, allowNull: false},
    cat        : { type: sequelize.mod.ENUM('event', 'drink', 'food','other'), allowNull: false},
    img        : { type: sequelize.mod.STRING, allowNull: true},
    hide       : { type: sequelize.mod.BOOLEAN, allowNull: false},
    createdAt  : { type: sequelize.mod.DATE, allowNull: false},
    updatedAt  : { type: sequelize.mod.DATE, allowNull: false},
});

var Product = {model : Products};

Product.createProduct = function (prix,nom,desc,qt,cat,img,date){
    return Products.create({
        prix       : prix       ,
        nom        : nom        ,
        desc       : desc       ,
        qtReal     : qt         ,
        qtVirt     : qt         ,
        cat        : cat        ,
        img        : img        ,
        hide        : false        ,
        createdAt  : date       ,
        updatedAt  : date       ,
    }).catch((err) => {
        return {err : true,text:"someting went wrong while creating a product\n" + err.stack};
    });
};

Product.getProductParam  = function(param){
    return Products.findAll({where : param});
};

Product.getProductById  = function(id){
    return Products.findById(id);
};

Product.incrementProd = function(idProd,value){
    return Products.findById(idProd).then((elem) => {
        if (!elem){
            return false;
        }


        return elem.increment({qtReal : value,qtVirt:value});
    });
}

Product.incrQtrProd = function(idProd,value){
    return Products.findById(idProd).then((elem) => {
        if (!elem){
            return false;
        }


        return elem.increment({qtReal : value});
    });
}

Product.reserveProd = function(idProd,value){
    return Products.findById(idProd).then((elem) => {
        if (!elem){
            return false;
        }

        return elem.increment({qtVirt:value});
    });
}

Product.reserveProdByInst = function(prod,value){
    return prod.increment({qtVirt:value});
}

Product.updateProduct  = function(id,values){
    return Products.findById(id).then(function(prod){
        if(prod)
            return prod.update(values);

        return "not found";
    });
};

Product.updateProductByInstance  = function(inst,values){
        return inst.update(values);
};


module.exports = Product;
