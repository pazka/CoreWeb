var express = require('express');
var ctrlUser = require('../controllers/user_ctrl');
var router = express.Router();

/* GET home page. */
router.use('/', function(req, res, next) {
    res.locals.role = ctrlUser.getUserInfos(req).ro;
    res.locals.roles = ctrlUser.getAllRoles();
    next();
});

router.get('/', function(req, res, next) {
    res.redirect('user');
});

router.get('/core', function(req, res, next) {
  res.render('apropos');
});

module.exports = router;
