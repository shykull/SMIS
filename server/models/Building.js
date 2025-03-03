module.exports = (sequelize, DataTypes) => {
    const Building = sequelize.define("Building", {
        Name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Level: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Unit: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Area: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        ShareUnit: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        OwnerName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        TenantName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    Building.associate = (models) => {
        Building.belongsToMany(models.Users, {
            through: 'UserBuildings',
            as: 'Users',
            foreignKey: 'BuildingId',
            otherKey: 'UserId',
            onDelete: "SET NULL",
        });
    };

    return Building;
};
