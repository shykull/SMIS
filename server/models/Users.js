module.exports = (sequelize,DataTypes) => {

    const Users = sequelize.define("Users", {
        username: {
            type: DataTypes.STRING,
            allownull:false,
        },
        password: {
            type: DataTypes.STRING,
            allownull:false,
        },
        email: {
            type: DataTypes.STRING,
            allownull:true,
        },
        firstname: {
            type: DataTypes.STRING,
            allownull:true,
        },
        lastname: {
            type: DataTypes.STRING,
            allownull:true,
        },
        contact: {
            type: DataTypes.STRING,
            allownull:true,
        },
        address: {
            type: DataTypes.STRING,
            allownull:true,
        },
        profilePicture: { // New field for profile picture
            type: DataTypes.STRING,
            allowNull: true,
        },
        
    });

    Users.associate = (models) => {
        Users.hasOne(models.Permissions,{
            onDelete: "cascade",
        });
      };

      Users.afterCreate(async (user, options) => {

        await sequelize.models.Permissions.create({
          UserId: user.id,
        });
      });

    

    return Users;

}