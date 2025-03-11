module.exports = (sequelize, DataTypes) => {
  const Visitors = sequelize.define('Visitors', {
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Name of the referenced model
        key: 'id' // Key in the referenced model
      }
    },
    visitorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Name of the referenced model
        key: 'id' // Key in the referenced model
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



  return Visitors;
};