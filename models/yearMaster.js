module.exports = function (sequelize, DataTypes) {
	const year_Details = sequelize.define('yearMaster', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			field : 'year_id'
		},
		yearName: {
			type : DataTypes.STRING,
			field : 'year_name'
		},
		yearOrder: {
			type : DataTypes.STRING,
			field : 'year_order'
		},
		startDate: {
			type : DataTypes.DATE,
			field : 'start_date'
		},
		endDate: {
			type : DataTypes.DATE,
			field : 'end_date'
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
			tableName: 'tbl_nk_cm_years',
			classMethods: {
				associate: function (Models) {
					// associations can be defined here
				}
			}
		});

	return year_Details;
};