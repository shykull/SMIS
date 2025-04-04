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
    },
    ownerComments: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null // Default to null if not provided
    },
    approvalStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0 // Default status is 0 (not approved)
    }
  });

  // Define associations
  Vehicles.associate = (models) => {
    Vehicles.belongsTo(models.Users, { as: 'Owner', foreignKey: 'ownerId' });
  };

  return Vehicles;
};