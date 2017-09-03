var Sequelize = require('sequelize');
console.log(process.env.bddbdd+" "+process.env.bdduser);
var sequelize = new Sequelize(process.env.bddbdd, process.env.bdduser, process.env.bddpsw);

sequelize.mod = Sequelize;

module.exports = sequelize;
