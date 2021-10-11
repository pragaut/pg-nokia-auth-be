module.exports = function (sequelize, DataTypes) {
    const groupAccess = sequelize.define('groupAccess', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },

        moduleName: DataTypes.STRING,
        access: DataTypes.INTEGER,
        app: DataTypes.STRING,
        active: DataTypes.BOOLEAN,
        createdBy: DataTypes.STRING,
        updatedBy: DataTypes.STRING,
    },
        {
            tableName: 'groupAccess',
            classMethods: {
                associate: function (Models) {
                    // associations can be defined here
                }
            }
        });

    return groupAccess;
};