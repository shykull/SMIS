module.exports = (sequelize, DataTypes) => {
    const waterReadings = sequelize.define("waterReadings", {
        month: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        reading: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    return waterReadings;
};