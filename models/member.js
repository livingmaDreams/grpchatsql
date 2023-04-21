const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Member = sequelize.define('member',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        allowNull:false,
        primaryKey:true
    },
    admin:{
        type: Sequelize.STRING
    }
});

module.exports = Member;