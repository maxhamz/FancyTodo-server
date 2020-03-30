'use strict';

const { hashPassword } = require('../helpers/bcrypt')

module.exports = (sequelize, DataTypes) => {
  class User extends sequelize.Sequelize.Model {}
  User.init({
  // const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          args: true,
          msg: "EMAIL FORMAT INVALID"
        }
      }
    } ,
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6,16],
          msg: "PASSWORDS MUST BETWEEN 6-16 CHARS"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: (user, options) => {
        user.password = hashPassword(user.password)
      },

      beforeUpdate: (user, options) => {
        user.password = hashPassword(user.password)
      }
    }
  });
  User.associate = function(models) {
    // associations can be defined here
    User.belongsToMany(models.Project, {through: 'ProjectUser'})
  };
  return User;
};