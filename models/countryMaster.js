module.exports = function (sequelize, DataTypes) {
    const countryMaster = sequelize.define('countryMaster', {
        id: {
			type: DataTypes.STRING,
			primaryKey: true,
            field : 'country_id'
		}, 
        countryName :{
            type : DataTypes.STRING,
            field : 'country_name'
        },
        countryCode :{
            type : DataTypes.STRING,
            field : 'country_code'
        },
        currencyCode :{
            type : DataTypes.STRING,
            field : 'currency_code'
        },
        currencyName :{
            type : DataTypes.STRING,
            field : 'currency_name'
        },
        dialCode :{
            type : DataTypes.STRING,
            field : 'dial_code'
        },
        isActive :{
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

    }, {
        tableName: 'tbl_cm_countries',
        classMethods: {
            associate: function (Models) {
                // associations can be defined here
            }
        }
    });
    return countryMaster
}