module.exports = function (sequelize, DataTypes) {
	const group_Details = sequelize.define('groupMaster', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			field : 'group_id'
		},
		groupName: {
			type : DataTypes.STRING,
			field : 'group_name'
		},
		groupCode: {
			type : DataTypes.STRING,
			field : 'group_code'
		},
		logoName: {
			type : DataTypes.STRING,
			field : 'logo_name'
		},
		logoUrl: {
			type : DataTypes.STRING,
			field : 'logo_url'
		},
		logoThumbUrl: {
			type : DataTypes.STRING,
			field : 'logo_thumb_url'
		},
		groupOrder: {
			type : DataTypes.STRING,
			field : 'group_order'
		},
		themeColor: {
			type : DataTypes.STRING,
			field : 'theme_color'
		},
		logoHeight: {
			type : DataTypes.STRING,
			field : 'logo_height'
		},
		logoWidth: {
			type : DataTypes.STRING,
			field : 'logo_width'
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
			tableName: 'tbl_nk_cm_groups',
			classMethods: {
				associate: function (Models) {
					// associations can be defined here
				}
			}
		});

	return group_Details;
};