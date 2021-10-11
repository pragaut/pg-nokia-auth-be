module.exports = function (sequelize, DataTypes) {
	const yearMaster = sequelize.define('yearMaster', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		yearTypeMasterId: DataTypes.STRING,
		yearName: DataTypes.STRING,
		yearCode: DataTypes.STRING,
		startDate: DataTypes.DATE,
		enddate: DataTypes.DATE,
		active: DataTypes.BOOLEAN,
		createdBy: DataTypes.STRING,
		//updatedBy: DataTypes.STRING
	},
		{
			tableName: 'tbl_YearMaster',
			classMethods: {
				associate: function (Models) {
					// associations can be defined here
				}
			}
		});

	return yearMaster;
};