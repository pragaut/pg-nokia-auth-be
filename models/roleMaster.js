module.exports = function (sequelize, DataTypes) {
	const roleMaster = sequelize.define('roleMaster', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			field :'role_id'
		}, 
		grpModulesId: {
			type : DataTypes.STRING,
			field : 'grp_modules_id'
		},
		roleName: {
			type : DataTypes.STRING,
			field : 'role_name'
		},
		roleOrder: {
			type : DataTypes.INTEGER,
			field : 'role_order'
		},
		dashboardUrl : {
			type : DataTypes.STRING,
			field : 'dashboard_url'
		},
		isMappingWithDeviceRequired: {
			type : DataTypes.BOOLEAN,
			field : 'is_mapping_with_device_required'
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
			tableName: 'tbl_nk_cm_roles',
			classMethods: {
				associate: function (Models) {
					// associations can be defined here
				}
			}
		});

	return roleMaster;
};