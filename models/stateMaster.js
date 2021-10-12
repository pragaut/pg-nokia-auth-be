module.exports = function (sequelize, DataTypes) {
    const stateMaster = sequelize.define('stateMaster', {
        id: {
			type: DataTypes.STRING,
			primaryKey: true,
            field : 'state_id'
		}, 
        countryId :{
            type : DataTypes.STRING,
            field : 'country_id'
        },
        stateName :{
            type : DataTypes.STRING,
            field : 'state_name'
        },
        stateCode :{
            type : DataTypes.STRING,
            field : 'state_code'
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
        tableName: 'tbl_cm_states',
        classMethods: {
            associate: function (Models) {
                // associations can be defined here
            }
        }
    });
    return stateMaster
}