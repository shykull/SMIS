module.exports = (sequelize, DataTypes) => {
    const UnitTransactions = sequelize.define("UnitTransactions", {
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

    return UnitTransactions;
};