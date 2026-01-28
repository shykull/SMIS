module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define("Transaction", {
        referenceNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        transactionDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'overdue', 'cancelled'),
            defaultValue: 'pending',
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    });

    Transaction.associate = (models) => {
        Transaction.belongsTo(models.BuildingAccount, {
            foreignKey: 'BuildingAccountId',
            onDelete: 'cascade',
        });
        Transaction.belongsTo(models.TransactionType, {
            foreignKey: 'TransactionTypeId',
            onDelete: 'restrict',
        });
        Transaction.hasMany(models.Payment, {
            foreignKey: 'TransactionId',
            onDelete: 'cascade',
        });
    };

    return Transaction;
};
