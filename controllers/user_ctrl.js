var model = require('../models/coreweb');
var session = require('client-sessions');
var utils = require('../utilities/utilities');

function getRandId(){
    return Math.abs(Math.round((Math.random()*99999))+1);
}
var User = {};

User.getNewId = function(){
        return 0;
};

User.getGoodId = function(id){
    return model.am.getAmicalisteById(id).then((usr)=>{
        if(usr)
            return User.getGoodId(getRandId());
        else
            return id;
    });
};

User.addUser= function(nom,prenom,psw,cpsw){
    var id = getRandId();
    psw_en = utils.encrypt(JSON.stringify(psw));

    return new Promise((resolve,reject)=>{
        if(psw != cpsw)
            return resolve({stat : "nok",text:"Le mot de passe et le mot de passe de confirmation ne sont pas identiques."});
        if(psw.length < 6)
            return resolve({stat : "nok",text:"Le mot de passe doit faire 6 caractère minimum"});


        return model.am.getAmicalisteParam({nom : nom, prenom, prenom}).then((result)=>{
            if(result.length == 0){
                //don't already exist
                User.getGoodId(id).then((id)=>{
                    return model.am.addAmicaliste(id,psw_en,0,nom,prenom,0,"",Date.now()).then((usr)=>{
                        return resolve({stat : "ok",idAm : usr.idAm});
                    }); //do this once you-ve found a good id
                });
            }else{
                //already exist
                return resolve({stat : "nok",text :"User already exist by that name & firstname"});
            }
        }).catch((err)=>{
            reject(err);
        });
    })
};

User.getAmicalisteById = function(id){
    return model.am.getAmicalisteById(id);
}
User.getAmicalisteByParam = function(p){
    return model.am.getAmicalisteParam(p);
}

User.upgradeUserToRegular= function(id){
    return model.am.getAmicalisteById(id).then(usr=>{
        if(usr.role >= User.role("regular"))
            return "User already regular or above";
        else
            return model.am.updateAmByInstance(usr,{role:User.role("regular")});
    });

};

User.updateAmById = function(id,remarque,mdp,mdpConf){
    return new Promise((resolve,reject) =>{
        if(remarque.length > 500){
            return reject("La remarque ne peut pas faire plus de 500 caractères.");
        }

        if(mdp != mdpConf){
            return reject("Les mots de passe ne sont pas identiques");
        }
        if(mdp != '' && mdp.length < 6){
            return reject("Le mot de passe doit faire 6 caractère minimum");
        }

        var val = {};

        if (mdp != '')
            val.psw = utils.encrypt(mdp);
        if (remarque != '')
            val.remarque = remarque;

        model.am.getAmicalisteById(id).then(usr =>{

            return model.am.updateAm(id,val).then(res=>{
                return resolve(res);
            }).catch(err=>{
                return reject(res);
            });
        }).catch(err=>{
            return reject(err);
        });
    });
};

User.convertAm = function(roleAf,role){
    return model.am.update({role : role},{where :{role:roleAf}});
}

User.createSession = function(user,req){
    user.psw = "You really think I would give you a password just like that ?";
    req.session.user = user;
};

User.cheatSession = function(){
    User.createSession({idAm : 85690, solde : 100, role : 1});
}

User.updateSession = function(req){
    model.am.getAmicalisteById(req.session.user.idAm).then((user)=>{
        //console.log(user);
        User.destroySession(req);
        if(user){
            User.createSession(user,req);
        }
        else
            console.log("\n!!!\nCouldn't update session\n\n")
    });
}

User.checkSession = function(req){
    return (req.session && req.session.user);
};

User.destroySession = function(req){
    if(req.session && req.session.user)
        delete req.session.user;
};

User.getUserInfos = function(req){
    if(!User.checkSession(req))
        return {
            id : undefined,
            cc : 0,
            ro : -1
        };

    return {
        id : req.session.user.idAm,
        cc : req.session.user.solde,
        ro : req.session.user.role
    };
}

User.roles = {
    "rand"   :0,
    "random" :0,
    "Rand"   :0,
    "Random" :0,
    0        : "Random",
    "retired":1,
    "Retired":1,
    "old    ":1,
    "ancien ":1,
    1        : "Ancien",
    "regular":2,
    "Regular":2,
    "Amicaliste":2,
    "amicaliste":2,
    2        : "Regular",
    "staff"  :3,
    "Staff"  :3,
    3        : "Staff",
    "admin"  :4,
    "Admin"  :4,
    4        : "Admin"
}

User.getAllRoles= function(){
    return User.roles;
}

User.role= function(type){
    return User.roles[type];
}

module.exports = User;
