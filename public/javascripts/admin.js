function promote(){
    var id = $("#idPromote").val();
    var role = $("#role").val();
    $.post('/admin/promote',{id : id,role:role},processData);
}

function convert(){
    var affectedRole = $("#roletoconvert").val();
    var role = $("#roleglobal").val();

    $.post('/admin/convert',{affectedRole : affectedRole, role:role},processData);
}

function refund(){
    var id = $("#idrefund").val();
    var amount = $("#amountrefund").val();
    $.post('/admin/refund',{id : id,amount:amount},processData);
}

function changeMoney(){
    var amount = $("#amount").val();
    $.post('/admin/refund',{amount:amount},processData);
}

function changeAvailability(){
    try {
        var val = $("#validityText").val();
        $.post('/admin/changeValidity',{val:val},processData);
    } catch (e) {
        processData(e);
    }
}

function changenews(){
    try {
        var val = $("#validityText").val();
        $.post('/admin/changeValidity',{val:val},processData);
    } catch (e) {
        processData(e);
    }
}

function changeMembershipPrice(){
    try {
        var val = $("#amountmsp").val();
        $.post('/admin/changeMembershipPrice',{val:val},processData);
    } catch (e) {
        processData(e);
    }
}

function processData(data){
    var d = new Date(Date.now());
    console.log(typeof d);
    $("#message").text(d.toLocaleTimeString() +" : " +data);
}

function loadDefault(){
    $("#validityText").val(JSON.stringify({"event":[{"start":{"h":"00","m":"01"},"end":{"h":"23","m":"59"}}],"drink":[{"start":{"h":"00","m":"01"},"end":{"h":"23","m":"59"}}],"food":[{"start":{"h":"00","m":"01"},"end":{"h":"23","m":"59"}}],"other":[{"start":{"h":"00","m":"01"},"end":{"h":"23","m":"59"}}]}
    ,undefined,4));
}

function changeSpePage(){
    var state = $("#statePage").is(":checked");

    $.post('/admin/displaySpePage',{state : state},processData);
}
