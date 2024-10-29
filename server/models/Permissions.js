module.exports = (sequelize, DataTypes) => {
    const Permissions = sequelize.define("Permissions", {
        visitor: {
            type: DataTypes.BOOLEAN,  
            allowNull: false,         
            defaultValue: true        // Default value for visitor
        },
        owner: {
            type: DataTypes.BOOLEAN,  
            allowNull: false,         
            defaultValue: false       
        },
        tenant: {
            type: DataTypes.BOOLEAN,  
            allowNull: false,         
            defaultValue: false       
        },
        sys_admin: {
            type: DataTypes.BOOLEAN,  
            allowNull: false,         
            defaultValue: false       
        },

        prop_manager: {
            type: DataTypes.BOOLEAN,  
            allowNull: false,         
            defaultValue: false       
        },

        site_manager: {
            type: DataTypes.BOOLEAN,  
            allowNull: false,         
            defaultValue: false       
        },
        
        admin: {
            type: DataTypes.BOOLEAN,  
            allowNull: false,         
            defaultValue: false       
        },

        account: {
            type: DataTypes.BOOLEAN,  
            allowNull: false,         
            defaultValue: false       
        },

        tech: {
            type: DataTypes.BOOLEAN,  
            allowNull: false,         
            defaultValue: false       
        },

        security: {
            type: DataTypes.BOOLEAN,  
            allowNull: false,         
            defaultValue: false       
        },
    });



    return Permissions;
};
