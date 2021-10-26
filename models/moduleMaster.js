module.exports = function (sequelize, DataTypes) {
	const module_Details = sequelize.define('moduleMaster', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			field : 'grp_modules_id'
		},
		grpDetailsId: {
			type : DataTypes.STRING,
			field : 'grp_details_id'
		},
		moduleName: {
			type : DataTypes.STRING,
			field : 'module_name'
		},
		moduleCode: {
			type : DataTypes.STRING,
			field : 'module_code'
		},
		isActive: {
			type : DataTypes.BOOLEAN,
			field : 'is_active'
		},		
		createdBy: {
			type : DataTypes.STRING,
			field : 'created_by'
		},
		createdAt: {
			type: DataTypes.DATE,
			field: 'created_on',
		  },
		modifiedBy: {
			type : DataTypes.STRING,
			field : 'modified_by'
		},
		updatedAt: {
			type: DataTypes.DATE,
			field: 'modified_on'
		  }
	},
		{
			tableName: 'tbl_nk_cm_grp_modules',
			classMethods: {
				associate: function (Models) {
					// associations can be defined here
				}
			}
		});

	return module_Details;
};