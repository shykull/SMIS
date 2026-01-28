module.exports = (sequelize, DataTypes) => {
    const TransactionType = sequelize.define("TransactionType", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        category: {
            type: DataTypes.ENUM('charge', 'payment', 'adjustment'),
            allowNull: false,
        },
    });

    TransactionType.associate = (models) => {
        TransactionType.hasMany(models.Transaction, {
            foreignKey: 'TransactionTypeId',
            onDelete: 'cascade',
        });
    };

    return TransactionType;
};
