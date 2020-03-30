'use strict';
module.exports = (sequelize, DataTypes) => {
  // const ProjectUser = sequelize.define('ProjectUser', {
  class ProjectUser extends sequelize.Sequelize.Model {}
  ProjectUser.init({
    ProjectId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER
  }, {
    sequelize, 
    modelName: 'ProjectUser'
  });
  ProjectUser.associate = function(models) {
    // associations can be defined here
    ProjectUser.belongsTo(models.User)
    ProjectUser.belongsTo(models.Project)
  };
  return ProjectUser;
};