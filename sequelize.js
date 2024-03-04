const { Sequelize, DataTypes } = require('sequelize');

// Configurações de conexão com o banco de dados
const sequelize = new Sequelize('myteam', 'postgres', 'nhj75u102030', {
  host: 'localhost',
  dialect: 'postgres',
});

const User = sequelize.define('users', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false 
});

module.exports = { sequelize, User };