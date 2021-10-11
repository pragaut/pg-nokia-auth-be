module.exports = function (sequelize, DataTypes) {
    const SuspiciousActivities = sequelize.define('SuspiciousActivities', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        userName: DataTypes.STRING,
        password: DataTypes.STRING,
        dateTime: DataTypes.DATE,
        count:DataTypes.INTEGER,
        ipAddress:DataTypes.STRING,         
        isInvalidUsername:DataTypes.BOOLEAN,
        isInvalidPassword:DataTypes.BOOLEAN,
        isAccountLocked: DataTypes.BOOLEAN,

        active: DataTypes.BOOLEAN,
        createdBy: DataTypes.STRING,
        updatedBy: DataTypes.STRING,
    },
        {
            tableName: 'tbl_SuspiciousActivities',
            classMethods: {
                associate: function (Models) {
                    // associations can be defined here
                }
            }
        });

    return SuspiciousActivities;
};