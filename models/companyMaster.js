module.exports = function (sequelize, DataTypes) {
	const companyMaster = sequelize.define('companyMaster', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		}, 
		groupMasterID: DataTypes.STRING,
		companyName: DataTypes.STRING,
		companyCode: DataTypes.STRING, 
		companyEmail : DataTypes.STRING,
		GSTNumber : DataTypes.STRING,
		companySortName : DataTypes.STRING,
		TANNumber: DataTypes.STRING,
		cityMasterId: DataTypes.STRING, 
		 
        isPlantWiseDataRequired: DataTypes.BOOLEAN,
        isCentralGroup: DataTypes.BOOLEAN,
		isInOperativeRecord: DataTypes.BOOLEAN, 
		yearTypeMasterId : DataTypes.STRING,
		
		active: DataTypes.BOOLEAN,
        createdBy: DataTypes.STRING,
		updatedBy: DataTypes.STRING
	},
		{
			tableName: 'tbl_CompanyMaster',
			classMethods: {
				associate: function (Models) {
					// associations can be defined here
				}
			}
		});

	return companyMaster;
};