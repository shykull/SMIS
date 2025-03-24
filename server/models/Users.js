module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define("Users", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        contact: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        profilePicture: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    Users.associate = (models) => {
        Users.hasOne(models.Permissions, {
            onDelete: "cascade",
        });
        Users.hasMany(models.Visitors, { as: 'OwnedVisitors', foreignKey: 'ownerId' });
        Users.hasMany(models.Visitors, { as: 'VisitorRecords', foreignKey: 'visitorId' });
        Users.belongsToMany(models.Building, {
            through: 'UserBuildings',
            foreignKey: 'UserId',
            as: 'Buildings',
            onDelete: "cascade",
        });
    };

    Users.afterCreate(async (user, options) => {
        await sequelize.models.Permissions.create({
            UserId: user.id,
        });
    });

    return Users;
};