module.exports = (sequelize, DataTypes) => {
  const Settings = sequelize.define('Settings', {
    property_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "My Property"
    },
    visit_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30
      },
    visit_hours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 8
     },
    visit_duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 7
      },
    owner_car: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2
      },
});
  
// Define associations

// Hook to create the first entry if it does not exist
Settings.afterSync(async (options) => {
  const settingsCount = await Settings.count();
  if (settingsCount === 0) {
    await Settings.create();
  }
});


return Settings;
};
    