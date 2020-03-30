'use strict';
const { customError } = require('../helpers/customError')
module.exports = (sequelize, DataTypes) => {
  // const Todo = sequelize.define('Todo', {
  class Todo extends sequelize.Sequelize.Model {}
  Todo.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull() {
          if(!this.title) {
            throw new customError(400, 'TITLE MUST BE FILLED')
          }
        }
      }
    },
    description: {
      allowNull: false,
      type: DataTypes.STRING,
      defaultValue: 'Lorem Ipsum'
    },
    status: {
      allowNull: false,
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    due_date: {
      type: DataTypes.DATE,
      validate: {
        beforeToday() {
          if (this.due_date < new Date()) {
            throw new customError(400, 'DATE LAPSED')
          }
        }
      }
    },
    ProjectId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Todo'
  });
  Todo.associate = function(models) {
    // associations can be defined here
  };
  return Todo;
};