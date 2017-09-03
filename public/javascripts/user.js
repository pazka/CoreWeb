function refresh(){
    $("#solde").text("...");
    $.get('/user/dashboard/solde').then(data=>{
        $("#solde").text(data.solde/100+" cc");
    });
}

refresh();
