module.exports = function (sequelize, DataTypes) {
	const yearTypeMaster = sequelize.define('yearTypeMaster', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		}, 
		yearTypeName: DataTypes.STRING,
        yearTypeCode: DataTypes.STRING,	
        yearTypeOrder: DataTypes.INTEGER ,
        isFinancialYear: DataTypes.BOOLEAN, 
        isCalendarYear: DataTypes.BOOLEAN,
		active: DataTypes.BOOLEAN,
        createdBy: DataTypes.STRING,
		//updatedBy: DataTypes.STRING
	},
		{
			tableName: 'tbl_yearTypeMaster',
			classMethods: {
				associate: function (Models) {
					// associations can be defined here
				}
			}
		});

	return yearTypeMaster;
};