module.exports = (sequelize, DataTypes) => {
    const BuildingAccount = sequelize.define("BuildingAccount", {
        accountNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        balance: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'suspended'),
            defaultValue: 'active',
        },
    });

    BuildingAccount.associate = (models) => {
        BuildingAccount.belongsTo(models.Building, {
            foreignKey: 'BuildingId',
            onDelete: 'cascade',
        });
        BuildingAccount.hasMany(models.Transaction, {
            foreignKey: 'BuildingAccountId',
            onDelete: 'cascade',
        });
    };

    return BuildingAccount;
};
