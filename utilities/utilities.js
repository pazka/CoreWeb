var CryptoJS = require("crypto-js");
var storage = require('node-persist');


var Utils = {};

Utils.encrypt= function(valToEnc){
        var not_secure_key = "73de13cf365ff2b5ddfbc96078305cef8fdc2990_go to the instalinstruction.txt";
        key = process.env.passwordKey ? process.env.passwordKey : not_secure_key;
        if( key == not_secure_key)
            console.log("\n\n\n!!!NOTSECURED_PASSWORD_encryption!!!\n\n\n");

        return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(valToEnc, key));
};

Utils.getAllMethods = function(object) {
    return Object.getOwnPropertyNames(object).filter(function(property) {
        return typeof object[property] == 'function';
    });
};

Utils.longestString = function(data){
    var arr = data;

    if (typeof arr === 'object'){
        arr = [];
        for (var prop in data) {
            arr.push(prop);
        }
    }
    return  arr.sort(function (a, b) { return b.length - a.length; })[0];
}

Utils.printObject = function(obj,end = false){
    var output = '';
    ll = Utils.longestString(obj).length;

    for (var property in obj) {
      output += "    " + property;
      for(i = 0 ; i<= ll - property.length ; i++){
          output += " ";
      }
      output += ': ' + obj[property]+'; \n';
    }

    return output;
}

Utils.cleanArray = function(arr,arrToIgnore){
    arrToIgnore = arrToIgnore ? arrToIgnore : ["",null,undefined];

    var res = [];
    arr.forEach(function(elem){
        found = false;
        arrToIgnore.forEach(function(elemTI){
            if(elem === elemTI){
                found = true;
            }
        });

        if(!found){
            res.push(elem);
        }
    });

    return res;
}

//when using this function, you need to makesure the fn return a bool
Utils.preventSpam = function(ip,index,timeToLive,limit,fn,fn_tooManyTries){
    storage.initSync({continuous : false,ttl:timeToLive*60*1000, interval : timeToLive* 60 *1000});
    var counter = storage.getItemSync(ip);
    console.log(counter);
    if(counter === undefined || counter[index] === undefined ){
        counter = {};
        counter[index] = 0;
    }

    if(counter[index] >= limit) //FAIL
        fn_tooManyTries();
    else{//EXEC OF MAIN FUNCTION
        var val = fn();
        if(val === undefined )
            console.log("ERROR : Prevent spam : function returning a usable value : " + val );
        if(!val)
            counter[index] = counter[index]+ 1;
        else
            counter[index] = 0;

        storage.setItemSync(ip,counter);
    }
}

//when using this function, you need to makesure the fn return a bool
Utils.preventSpamAsync = function(ip,index,timeToLive,limit,fn,fn_tooManyTries){
    storage.initSync({continuous : false,ttl:false,expiredInterval:timeToLive*60*1000});
    var counter = storage.getItemSync(ip);
    if(counter === undefined || counter[index] === undefined ){
        counter = {};
        counter[index] = 0;
    }
    counter[index] = 0;//TODO FIX THAT SHIT

    if(counter[index] > limit) //FAIL
        fn_tooManyTries();
    else{//EXEC OF MAIN FUNCTION
        var val = fn().then(val =>{
            if(val !== true || val !== false)
                console.log("ERROR : Prevent spam : function returning a usable value : " + val );

            if(!val)
                counter[index] = counter[index]+ 1;
            else
                counter[index] = 0;

            storage.setItemSync(ip,counter);
        });
    }
}

module.exports = Utils;
