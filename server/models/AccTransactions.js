module.exports = (sequelize, DataTypes) => {
    const Transactions = sequelize.define("Transactions", {
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ammount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
    });

    return Transactions;
};