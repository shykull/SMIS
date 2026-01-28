module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define("Payment", {
        paymentMethod: {
            type: DataTypes.ENUM('cash', 'check', 'bank_transfer', 'credit_card', 'debit_card'),
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        paymentDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        referenceNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        receiptNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    });

    Payment.associate = (models) => {
        Payment.belongsTo(models.Transaction, {
            foreignKey: 'TransactionId',
            onDelete: 'cascade',
        });
    };

    return Payment;
};
