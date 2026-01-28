module.exports = (sequelize, DataTypes) => {
    const AccSettings = sequelize.define("AccSettings", {
        shareUnitPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 1.00,
        },
        waterBillRate: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.76,
        },
    });

    // Hook to create the first entry if it does not exist
    AccSettings.afterSync(async (options) => {
    const settingsCount = await AccSettings.count();
    if (settingsCount === 0) {
      await AccSettings.create();
    }
  });



    return AccSettings;
};