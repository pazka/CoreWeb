//button to change indiv the stocks

var params = {};

function completeParams(id,field){
    if(field == "qtVirt" || field == "qtReal")
        var prop = $("#"+field+"-"+id).text();
    else if(field == "prix")
        var prop = $("#"+field+"-"+id).val()*100;
    else
        var prop = $("#"+field+"-"+id).val();

    if(params[id])
        params[id][field] = prop;
    else{
        var ob = {};
        ob[field] = prop;
        params[id] = ob;
    }
}

function updateProd(id){
    if(params[id].length == 0)
        return false;

    $.post('/stock/update',{changes : JSON.stringify(params[id]),id:id}, function(data) {
        $("#mess").text(data);
    });
    params[id] = {};
}

function softdeleteProd(id){
    if (confirm("Attention ! Une fois le produit supprimé, il faudra connaitre son id -"+id+"- pour le faire réaparaitre ! ")){
        $.post('/stock/softdelete',{id:id}, function(data) {
            location.reload();
        });
    }
}
//TODO HISTORIQUE DES STOCK  DES PRODUITS

function createProd(){
    var param ={
           nom: $("#nom").val(),
          prix: $("#prix").val(),
          desc: $("#desc").val(),
           cat: $("#cat").val(),
           img: $("#img").val()
    }
    $.post('/stock/create',{param:JSON.stringify(param)}, function(data) {
        location.reload();
    });
}

function incProd(id,value){
    var val = $("#qtR"+id).val();
    $.post('/stock/changeQt',{id:id,qt : value * parseInt(val)}, function(data) {
        location.reload();
    });
}

function incProdVirt(id,value){
    var val = $("#qtV"+id).val();
    $.post('/stock/changeQtVirt',{id:id,qt : value * parseInt(val)}, function(data) {
        location.reload();
    });
}

function softcreateProd(){
    $.post('/stock/softcreate',{id:$("#id").val()}, function(data) {
        location.reload();
});
}

$(document).ajaxError(function( event, jqxhr, settings, thrownError ){
    $("#mess").text(jqxhr.responseText);
});
