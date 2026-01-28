module.exports = (sequelize, DataTypes) => {
    const AccountingSettings = sequelize.define("AccountingSettings", {
        lateInterestRate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 10.00,
            comment: 'Late payment interest rate in percentage'
        },
        managementRate: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 13.90,
            comment: 'Monthly management fee rate'
        },
        utilitiesRate: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 150.00,
            comment: 'Monthly utilities rate'
        },
        facilitiesBookingRate: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.00,
            comment: 'Facilities booking rate'
        },
        waterRate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0.76,
            comment: 'Water billing rate per unit'
        },
        taxRate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0.00,
            comment: 'Tax rate in percentage'
        },
        lastUpdatedBy: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    // Hook to create the first entry if it does not exist
    AccountingSettings.afterSync(async (options) => {
        const settingsCount = await AccountingSettings.count();
        if (settingsCount === 0) {
            await AccountingSettings.create();
        }
    });

    return AccountingSettings;
};
