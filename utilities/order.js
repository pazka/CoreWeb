/*constructor array must be :
{
idAm : _,
remarque : _,
state : _,
products : [{
    idProd : _,
    qt : _,
    reduc : _,
    token : _,
}]}
*/

var Order = function(idAm,remarque,state,products){
    this.idAm = idAm;
    this.remarque = remarque;
    this.state = state;
    this.products = products;

    this.addProduct = function(product){
        if(product.idProd === undefined ||product.qt === undefined){
            return 0;
        }

        this.products.push(product);
    };

    this.getProducts = function(){
        return this.products;
    };

    this.removeProduct = function(product){
        this.products.splice(this.products.indexOf(product),1);
    }

/*
    this.addToketToProduct = function(token){
        this.products.forEach
    };
*/
    this.getArray = function(){
        return {
            idAm : this.idAm,
            remarque : this.remarque,
            state : this.state,
            products : this.products
        };
    };
}

module.exports = Order;
