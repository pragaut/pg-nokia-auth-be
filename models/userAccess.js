module.exports = function (sequelize, DataTypes) {
	const userAccess = sequelize.define('userAccess', {
		id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        userId: DataTypes.STRING,
        moduleName: DataTypes.STRING,
        access: DataTypes.INTEGER,
        app: DataTypes.STRING,
        active: DataTypes.BOOLEAN,
        createdBy: DataTypes.STRING,
		updatedBy: DataTypes.STRING,
	},
		{
			tableName: 'userAccess',
			classMethods: {
				associate: function (Models) {
					// associations can be defined here
				}
			}
		});

	return userAccess;
};