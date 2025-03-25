module.exports = (sequelize, DataTypes) => {
  const Visitors = sequelize.define('Visitors', {
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Name of the referenced model
        key: 'id', // Key in the referenced model
        onDelete: 'CASCADE' // Cascade delete
      }
    },
    visitorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Name of the referenced model
        key: 'id', // Key in the referenced model
        onDelete: 'CASCADE' // Cascade delete
      }
    },
    visitorCar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    visitStartDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    visitEndDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });
  
  // Define associations
  Visitors.associate = (models) => {
    Visitors.belongsTo(models.Users, { as: 'Owner', foreignKey: 'ownerId' });
    Visitors.belongsTo(models.Users, { as: 'Visitor', foreignKey: 'visitorId' });
  };


  return Visitors;
};