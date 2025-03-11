module.exports = (sequelize, DataTypes) => {
    const Announce = sequelize.define("Announce", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        content: {
            type: DataTypes.BLOB('medium'),
            allowNull: false,
        },

        attachment: {
            type: DataTypes.STRING,
            allowNull: true,
        },

    });


    return Announce;
};