module.exports = function (sequelize, DataTypes) {
	const token = sequelize.define('token', {
		id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        
        refreshToken: DataTypes.STRING,
		email: DataTypes.STRING,
		userId: DataTypes.STRING,
        createdBy: DataTypes.STRING,
		updatedBy: DataTypes.STRING,
	},
		{
			tableName: 'tbl_Token',
			classMethods: {
				associate: function (Models) {
					// associations can be defined here
				}
			}
		});

	return token;
};