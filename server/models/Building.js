module.exports = (sequelize, DataTypes) => {
    const Building = sequelize.define("Building", {
        block: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        level: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        area: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        shareUnit: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    Building.associate = (models) => {
        Building.belongsToMany(models.Users, {
            through: 'UserBuildings',
            foreignKey: 'BuildingId',
            as: 'Users',
            onDelete: "cascade",
        });
    };

    return Building;
};
