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
        address1: {
            type: DataTypes.STRING,
            allownull:true,
        },
        address2: {
            type: DataTypes.STRING,
            allownull:true,
        },
        city: {
            type: DataTypes.STRING,
            allownull:true,
            default: "Kuching"
        },
        state: {
            type: DataTypes.STRING,
            allownull:true,
            default: "Sarawak"
        },
        postcode: {
            type: DataTypes.STRING,
            allownull:true,
            default: "93000"
        },
        country: {
            type: DataTypes.STRING,
            allownull:true,
            default: "Malaysia"
        }
    });

    return Users;

}