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
    });

    Building.associate = (models) => {
        Building.belongsToMany(models.Users, {
            through: 'UserBuildings',
            foreignKey: 'BuildingId',
            onDelete: "cascade",
        });
    };

    return Building;
};
