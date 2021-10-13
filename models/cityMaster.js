module.exports = function (sequelize, DataTypes) {
    const cityMaster = sequelize.define('cityMaster', {
        id: {
			type: DataTypes.STRING,
			primaryKey: true,
            field : 'city_id'
		}, 
        stateId :{
            type : DataTypes.STRING,
            field : 'state_id'
        },
        cityName :{
            type : DataTypes.STRING,
            field : 'city_name'
        },
        cityCode :{
            type : DataTypes.STRING,
            field : 'city_code'
        },
        postalCode :{
            type : DataTypes.STRING,
            field : 'postal_code'
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
        tableName: 'tbl_cm_cities',
        classMethods: {
            associate: function (Models) {
                // associations can be defined here
            }
        }
    });
    return cityMaster
}