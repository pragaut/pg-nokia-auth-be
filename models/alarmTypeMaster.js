module.exports = function (sequelize, DataTypes) {
	const alarmType_Details = sequelize.define('alarmTypeMaster', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			field : 'alarm_type_id'
		},
		alarmTypeName: {
			type : DataTypes.STRING,
			field : 'alarm_type_name'
		},
		alarmTypeCode: {
			type : DataTypes.STRING,
			field : 'alarm_type_code'
		},
		alarmTypeOrder: {
			type : DataTypes.STRING,
			field : 'alarm_type_order'
		},
		colorCode: {
			type : DataTypes.STRING,
			field : 'color_code'
		},
		bgColorCode: {
			type : DataTypes.STRING,
			field : 'bg_color_code'
        },
		isRemarksRequired: {
			type : DataTypes.STRING,
			field : 'is_remarks_required'
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
			tableName: 'tbl_nk_cm_alarm_types',
			classMethods: {
				associate: function (Models) {
					// associations can be defined here
				}
			}
		});

	return alarmType_Details;
};