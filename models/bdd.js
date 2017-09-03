var Sequelize = require('sequelize');
var sequelize = new Sequelize(process.env.bddbdd, process.env.bdduser, process.env.bddpsw,{host: 'localhost',
dialect: 'mysql'});

sequelize.mod = Sequelize;

module.exports = sequelize;
