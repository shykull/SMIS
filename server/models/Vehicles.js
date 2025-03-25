module.exports = (sequelize, DataTypes) => {
  const Vehicles = sequelize.define('Vehicles', {
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Name of the referenced model
        key: 'id', // Key in the referenced model
        onDelete: 'CASCADE' // Cascade delete
      }
    },
    carPlateNumber: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  // Define associations
  Vehicles.associate = (models) => {
    Vehicles.belongsTo(models.Users, { as: 'Owner', foreignKey: 'ownerId' });
  };

  return Vehicles;
};