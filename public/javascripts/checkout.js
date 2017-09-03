
$(document).ajaxError(function( event, jqxhr, settings, thrownError ){
    $("#message").append(jqxhr.responseText);
});

function validate(idToValidate){
    if(idToValidate == null || idToValidate == "" || !Number.isInteger(idToValidate))
        $("#message").html("Id incorrecte");

    $.post('/checkout/validateBasket',{baskId :idToValidate}, function(data){
        $("#message").html(data);
        $("#untreatedBask").attr("data-nb", $("#untreatedBask").attr("data-nb") -1);
        $("#untreatedBask").html($("#untreatedBask").attr("data-nb") + " untreated baskets");
        $("#bask"+idToValidate).addClass("hidden");

    });
}

function cancel(idToCancel){
    if(idToCancel == null || idToCancel == "" || !Number.isInteger(idToCancel))
        $("#message").html("Id incorrecte");

    $.post('/checkout/cancelBask',{baskId :idToCancel}, function(data){
        $("#message").html(data);
        $("#untreatedBask").attr("data-nb", $("#untreatedBask").attr("data-nb") -1);
        $("#untreatedBask").html($("#untreatedBask").attr("data-nb") + " untreated baskets");
        $("#bask"+idToCancel).addClass("hidden");
    });
}

$("#activateList").click((elem)=>{
    $("#activateList").text($("#activateList").text() == ">" ? "<" : ">");
    $(".listToValidate").toggleClass("hide");
});

var state = "lq_";
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
        var pToAppend = $("<div class='eltListProd row "+elt.cat+"Css'><p>"+elt.nom+":"+elt.qt+"</p><p>"+"%"+elt.reduc+"</p><p class='crossRemove' onclick=removeProduct("+elt.idProd+")>X</p></div>");
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
            reduc:($("#reduc").val() ? $("#reduc").val() : 0)
        });

    updateOrder();
}

var updatePrice = function(){
    var price = 0;
    orderProds.forEach((elt)=>{
        price += Math.round(elt.prix * elt.qt * (1-elt.reduc/100));
    });

    $("#totalPrice").text(price/100);
}

$("#execButton").click((elem)=>{
    var order = new Order($("#idAm").val(),$("#remarque").val() ? $("#remarque").val() : "",state,orderProds);

    if( (order.idAm == "" || order.idAm == null || order.idAm == undefined ) && state !="lq_"){
        $("#message").html("No Id");
    }else if(order.products.length ==0){
        $("#message").html("No Products");
    }
    else{
        $.post('/checkout/execute',{order:JSON.stringify(order)}, function(data){
            $("#message").html("");
            data=JSON.parse(data);
            data.forEach((elt)=>{
                $("#message").append($("<p>"+elt.text+"</p>"));
            });
        });
        clean();
    }
    updateProducts();
});

function clean(){
    $("#idAm").val("");
    $("#remarque").val("");
    $("#reduc").val("");
    $("#message").html("");
    orderProds=[];
    updateOrder();
}


function displayProducts(arr){
    arr.forEach(elt=>{
        $("#"+elt.idProd+"qtv").text(elt.qtVirt);
        $("#"+elt.idProd+"qtr").text(elt.qtReal);
        $("#"+elt.idProd+"price").text(elt.prix/100);
    });
}

function updateProducts(){
    $.get('/checkout/getRawProds').then((allProd)=>{
        parse = JSON.parse(allProd);
        displayProducts(parse);
    });
}

function displayBasks(arr){
    allBask=[];
    arr.forEach(b=>{
        //Date=danger
        //remarque
        // ocntent idbask
        //state
        //ifstate
        //desc
        //price/100
        //    eachprod bask.ventes
        //    p class cat+css qt +.+nom
        //
        //TODO BASKET UPDATE
        //TODO STATS
        var bask = $('<div class="bask" id="bask'+b.idBask+'><div class="control"><button class="btn btn-sm btn-danger" type="button" onclick="cancel('+b.idBask+')">x</button><p class="highlight" id="'+b.idBask+'" onmouseenter="hideRemarque('+b.idBask+')" onmouseleave="hideRemarque('+b.idBask+')" data-remarque="#85690:sss">'+b.idBask+'</p><button class="btn btn-sm btn-primary" type="button" onclick="validate('+b.idBask+')">v</button></div><p class="stateTxt highlightRed">lq_</p><p class="desc hidden" id="desc'+b.idBask+'">'+b.remarque+'</p><p id="priceBask">'+b.prixTot+'</p><div class="listProd"><p class="drinkCss">1.qsdqsd</p></div></div>');
    });
}

function updateProductsAndBasks(){
    $.get('/checkout/getRawProdsAndBasks').then((allProd)=>{
        parse = JSON.parse(allProd);

        displayProducts(parse[0]);

    });
}

function validateAmicaliste(){
    if($("#idVal").val() != ""){
        $.post('/checkout/validateAmicaliste',{id:$("#idVal").val()}, function(data){
            $("#message").html(data);
        });
    }
}

function validateAmicalisteId(id){
    $.post('/checkout/validateAmicaliste',{id:id}, function(data){
        $("#message").html(data + " ID:#" + id);
    });
}

function fillAccount(){
    if($("#idFill").val() != "" && $("#amountFill").val() != "" ){
        $.post('/checkout/fillAccount',{id:$("#idFill").val(),amount:$("#amountFill").val()*100}, function(data){
            $("#message").html(data);
        });
    }
}

function getAmicaliste(){
    if($("#getIdAm").val() != ""){
        $.post('/checkout/getUser',{id:$("#getIdAm").val()}, function(data){
            $("#userInfos").text(JSON.stringify(data));
        });
    }
}

function getAmicalisteName(){
    if($("#getIdAmName").val() != ""){
        $.post('/checkout/getUserName',{name:$("#getIdAmName").val()}, function(data){
            $("#userInfosName").text(JSON.stringify(data));
        });
    }
}

function createAmicaliste(){
    if($("#name").val() != "" && $("#surname").val() != "" ){
        $.post('/checkout/createAmicaliste',{name:$("#name").val(),firstname:$("#surname").val()}, function(data){
            data = JSON.parse(data);
            $("#createdUser").text(data.text);
            validateAmicalisteId(data.id);
        });
    }
}

//init


function hideRemarque(id){
    $("#desc"+id).toggleClass("hidden");
}
