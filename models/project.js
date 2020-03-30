'use strict';
const { customError } = require('../helpers/customError')
module.exports = (sequelize, DataTypes) => {
  // const Project = sequelize.define('Project', {
  class Project extends sequelize.Sequelize.Model {}
  Project.init({  
    UserId: DataTypes.INTEGER,
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
    }
  }, {
    sequelize, 
    modelName: 'Project'
  });
  Project.associate = function(models) {
    // associations can be defined here
    Project.belongsToMany(models.User, {through: 'ProjectUser'}),
    Project.hasMany(models.Todo)
  };
  return Project;
};