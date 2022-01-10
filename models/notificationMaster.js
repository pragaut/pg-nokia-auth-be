module.exports = function (sequelize, DataTypes) {
	const notification_Details = sequelize.define('notificationMaster', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			field : 'notification_id'
		},
		notificationName: {
			type : DataTypes.STRING,
			field : 'notification_name'
		},
		notificationCode: {
			type : DataTypes.STRING,
			field : 'notification_code'
		},
		notificationOrder: {
			type : DataTypes.STRING,
			field : 'notification_order'
		},
		alarmTypeId: {
			type : DataTypes.STRING,
			field : 'alarm_type_id'
		},
		message: {
			type : DataTypes.STRING,
			field : 'message'
		},
		title: {
			type : DataTypes.STRING,
			field : 'title'
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
			tableName: 'tbl_nk_cm_notifications',
			classMethods: {
				associate: function (Models) {
					// associations can be defined here
				}
			}
		});

	return notification_Details;
};