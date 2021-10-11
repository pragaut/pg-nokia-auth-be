module.exports = function (sequelize, DataTypes) {
    const accessGroup = sequelize.define('accessGroup', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },

        name: DataTypes.STRING,
        description: DataTypes.STRING,
        app: DataTypes.STRING,

        active: DataTypes.BOOLEAN,
        createdBy: DataTypes.STRING,
        updatedBy: DataTypes.STRING,
    },
        {
            tableName: 'accessGroup',
            classMethods: {
                associate: function (Models) {
                    // associations can be defined here
                }
            }
        });

    return accessGroup;
};