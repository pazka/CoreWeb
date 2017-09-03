var Sequelize = require('sequelize');
var sequelize = new Sequelize(process.env.bddbdd, process.env.bdduser, process.env.bddpsw,{host: 'localhost',
dialect: 'mysql',
  // disable logging; default: console.log
  logging: false});

sequelize.mod = Sequelize;

module.exports = sequelize;
