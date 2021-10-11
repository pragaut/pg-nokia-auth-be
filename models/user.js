module.exports = function (sequelize, DataTypes) {
	const user = sequelize.define('user', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			field :'user_id'
		}, 
		username: DataTypes.STRING,
		employeeId: {
			type: DataTypes.STRING,
			field :'employee_id'
		}, 
		roleId: {
			type: DataTypes.STRING,
			field :'role_id'
		},
		password: DataTypes.STRING,
		saltPassword: {
			type: DataTypes.STRING,
			field :'salt_password'
		}, 
		accessGroupId: {
			type: DataTypes.STRING,
			field :'access_group_id'
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
			tableName: 'tbl_nk_users',
			classMethods: {
				associate: function (Models) {
					// associations can be defined here
				}
			}
		});

	return user;
};