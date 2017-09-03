
var state = "vm_";
var orderProds = []; //looks like [{idprod:3,qt:2,name:"cafe",cat:"event"},...]

var changeStatus = function(){
    state = $("#state").is(":checked") ? "vm_" : "lq_";
    $("#lblStat").text((state == "vm_")?"CoreCoin":"Espèces");
}

//CURRENT ORDER
//functions to come arte badly named I'm sorry :(
var updateOrder = function(){
    $("#orderProd").html("");
    orderProds.forEach((elt)=>{
        var pToAppend = $("<div class='eltListProd row'><p>"+elt.nom+":"+elt.qt+"</p><p class='crossRemove' onclick=removeProduct("+elt.idProd+")>X</p></div>");
        $("#orderProd").append(pToAppend);
    });
    updatePrice();
}

var removeProduct = function(idProd){
    orderProds.forEach((elt)=>{
        if(elt.idProd == idProd){
            orderProds.splice(orderProds.indexOf(elt),1);
        }
    });
    updateOrder();
}

var addProduct = function(idProd){
    var found = false;
    orderProds.forEach((elt)=>{
        if(elt.idProd == idProd){
            elt.qt++;
            found=true;
        }
    });

    if(!found)
        orderProds.push({
            idProd : idProd,
            qt : 1,
            nom : $("#"+idProd+"name").text(),
            cat :$("#"+idProd+"Btn").attr("data-cat"),
            prix:$("#"+idProd+"Btn").attr("data-prix"),
            reduc:0
        });
    updateOrder();
}

var updatePrice = function(){
    var price = 0;
    orderProds.forEach((elt)=>{
        price += Math.round(elt.prix * elt.qt);
    });
    $("#totalPrice").text(price/100);
}

$("#execButton").click((elem)=>{
    var order = new Order("unknown",$("#remarque").val() ? $("#remarque").val() : "",state,orderProds);

    if(order.idAm == "" || order.idAm == null || order.idAm == undefined){
        $("#message").html("No Id");
    }else if(order.products.length ==0){
        $("#message").html("No Products");
    }
    else{
        $.post('/shop/execute',{order:JSON.stringify(order)}, function(data){
            $("#message").html("");
            data=JSON.parse(data);
            data.forEach((elt)=>{
                $("#message").append($("<p>"+elt.text+"</p>"));
            });
        });
        clean();
    }
});

function clean(){
    $("#idAm").val("");
    $("#remarque").val("");
    $("#reduc").val("");
    orderProds=[];
    updateOrder();
}

$(document).ajaxError(function( event, jqxhr, settings, thrownError ){
    $("#message").append(jqxhr.responseText);
});
