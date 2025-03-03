module.exports = (sequelize, DataTypes) => {
    const UserBuildings = sequelize.define("UserBuildings", {
        UserId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: "SET NULL",
        },
        BuildingId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Buildings',
                key: 'id',
            },
            onDelete: "SET NULL",
        },
    });

    return UserBuildings;
};