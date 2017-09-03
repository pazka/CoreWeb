var Sequelize = require('sequelize');
var sequelize = new Sequelize('coreweb', 'root', process.env.bddpsw);

sequelize.mod = Sequelize;

module.exports = sequelize;
