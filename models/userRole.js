module.exports = function (sequelize, DataTypes) {
	const userRole = sequelize.define('userRole', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			field: 'user_role_id'
		}, 
		userId: {
			type : DataTypes.STRING,
			field : 'user_id'
		},
		roleId: {
			type : DataTypes.STRING,
			field : 'role_id'
		},
		isBlocked: {
			type : DataTypes.BOOLEAN,
			field : 'is_blocked'
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
			tableName: 'tbl_nk_user_roles',
			classMethods: {
				associate: function (Models) {
					// associations can be defined here
				}
			}
		});

	return userRole;
};