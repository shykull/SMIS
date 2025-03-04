module.exports = (sequelize, DataTypes) => {
    const UserBuildings = sequelize.define("UserBuildings", {
        // In UserBuildings model definition
        UserId: {
            type: DataTypes.INTEGER.UNSIGNED, // Match Users.id
            allowNull: false,
            references: {
            model: 'Users',
            key: 'id'
            }
        },
        BuildingId: {
            type: DataTypes.INTEGER.UNSIGNED, // Match Buildings.id
            allowNull: false,
            references: {
            model: 'Buildings',
            key: 'id'
            }
        }
    });

    return UserBuildings;
};