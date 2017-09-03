var user_ctrl = require('../controllers/user_ctrl');
var utils = require('../utilities/utilities');
var model = require('../models/coreweb');

var Money = {};

//this functio check if the user has the authorisation required to execute the transaction
Money.isTransactionLegal = function(id,amount){
    return user_ctrl.getAmicalisteById(id).then((user) => {
        if(user.role < user_ctrl.role("staff") && user.solde + amount < 0)
            return "no";
        else
            return user;
    }).catch((err) =>{
        return err;
    });
};

var changeMoneyByIdNoRecord = function (id,amount){
    return Money.isTransactionLegal(id,amount).then((usr) => {
        if(usr != "no")
            return model.am.changeMoneyByInst(usr,amount).then(usr=>{
                return "ok";
            }).catch((err) =>{
                return err;
            });
        else
            return "User has not enough money and can't have debt";
    }).catch((err) =>{
        return err;
    });
};


Money.changeMoneyById = function (id,amount){
    return Money.isTransactionLegal(id,amount).then((usr) => {
        if(usr != "no")
            return model.am.changeMoneyByInst(usr,amount).then(usr=>{
                model.tr.createTrans(id,id,amount,Date.now())
                return "ok";
            }).catch((err) =>{
                return err;
            });
        else
            return "User has not enough money and can't have debt";
    }).catch((err) =>{
        return err;
    });
};


/*this function could have been better but it's too old and costly to change now.
At least it work as intented and prevent errors and bad cases
*/

Money.transfertMoney = function (idSender,idReceiver,amount,bypassid = false){
    return new Promise((resolve,reject)=>{
        if(idReceiver == idSender && !bypassid)
            return resolve("You can't send money to yourself silly :p ");

        else if(amount < 1)
            return resolve("Can't send less than 0.1 c.c.")

        var idCheck =  [user_ctrl.getAmicalisteById(idReceiver),user_ctrl.getAmicalisteById(idSender)];
        return Promise.all(idCheck).then((userRes)=>{//receiver exist

            if(!userRes[0])
                return resolve("Receiver doesn't exist");

            if(!userRes[1])
                return resolve("Sender doesn't exist");


            changeMoneyByIdNoRecord(idSender,-amount).then((res) => {
                if(res != "ok")
                    return resolve(res);

                changeMoneyByIdNoRecord(idReceiver,amount);//no reason he can't accept money

                //creation of records
                return model.tr.createTrans(idSender,idReceiver,amount,Date.now()).then(()=>{
                    return resolve("ok");
                }).catch((error) => {
                    //if error cancel previous transfer
                    changeMoneyByIdNoRecord(idSender,amount);
                    changeMoneyByIdNoRecord(idReceiver,-amount);
                    reject("Couldn't create transaction\n" + error + "\n" + error.stack);
                });
            }).catch((err) =>{
                reject("Something went wrong while transfering"+ error + "\n" + error.stack);
            });
        }).catch((err) =>{
            reject("Something went wrong while transfering"+ error + "\n" + error.stack);
        });
    });
}

Money.getAllTrans = function(id){
    return model.tr.getTransaction(id);
}

module.exports = Money;
