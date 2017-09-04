var express = require('express');
var dashboard = require('../routes/dashboard');
var ctrl = require('../controllers/user_ctrl');
var utils = require('../utilities/utilities');
var router = express.Router();

router.use('/dashboard',dashboard);

router.use('/', function(req, res, next){
    next();
});

router.get('/', function(req, res, next) {
    res.redirect('user/login');
});

router.get('/register', function(req, res, next) {
    res.render('user/register');
});

router.get('/login', function(req, res, next) {
    res.render('user/login');
});

router.get('/notsignedin', function(req, res, next) {
    res.render('user/mess/messageLogin',{message : "You need to sign in first"});
});

router.post('/register', function(req, res, next) {
    ctrl.addUser(req.body.name,req.body.firstname,req.body.password,req.body.confirmPassword).then((result)=>{
        if(result.stat == "ok")
            res.render('user/mess/registerDone',{userId : result.idAm}); //success
        else
            res.render('user/register',{err:result.text});
    }).catch((err) =>{
        res.render('user/register',{err : "something went wrong :\n" + err + err.stack})
    });
});

router.get('/update', function(req, res, next) {
        res.render('user/update');
});

router.post('/update', function(req, res, next) {
    var infos = ctrl.getUserInfos(req);
    var rem = req.body.remarque;
    var psw = req.body.psw;
    var pswConfirm = req.body.pswConfirm;

    ctrl.updateAmById(infos.id,rem,psw,pswConfirm).then(result=>{
        res.render('user/update',{success : result});
    }).catch(err=>{
        res.render('user/update',{err : "Something went wrong : "+ err});
    });
});

router.post('/login', function(req, res, next) { // TODO Clean up and put in controller
    utils.preventSpamAsync(req.ip,"login",2,3,()=>{
        return ctrl.getAmicalisteById(req.body.id).then((user) => {//SUCCESS
            if(user)
                if(utils.encrypt(JSON.stringify(req.body.password)) == user.psw){
                    ctrl.destroySession(req);
                    ctrl.createSession(user,req);
                    res.redirect('/user/dashboard');
                    return true;
                }else{ //FAIL
                    res.render("user/login",{err:"bad password"});
                    return false;
                }
            else
                res.render("user/login",{err:"bad ID"});
                return false;
        });
    },()=>{
        res.render("user/login",{err:"Trop d'essai, veuillez ressayer dans 2 minutes."});
    });
});

router.use('/logout', function(req, res, next) {
    ctrl.destroySession(req);
    res.render('user/mess/messageLogin',{message : "You are logged out"});
});

/*Not tested
router.post('/update', function(req, res, next) {
    ctrl.addUser(req.nom,req.prenom,req.psw);
    res.render('user/mess/registerDone', { title: 'testUser' });
});
*/

module.exports = router;
