module.exports = function (sequelize, DataTypes){
    const genderMaster = sequelize.define('genderMaster',
    {
        id : {
            type: DataTypes.STRING,
            primaryKey: true,
            field:'gender_id'
        },
        genderName : {
            type: DataTypes.STRING,
            field:'gender_name'
        },
        isActive : {
            type: DataTypes.BOOLEAN,
            field:'is_active'
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
        tableName: 'tbl_cm_genders',
            classMethods: {
                associate: function (Models) {
                    // associations can be defined here
                }
            },
        
    });
    return genderMaster
};