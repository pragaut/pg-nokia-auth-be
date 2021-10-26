module.exports = function(sequelize, DataTypes){
    const organisationModuleDetails = sequelize.define('organisationModuleDetails', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            field:'org_module_details_id'
        },
        orgDetailsId : {
         type: DataTypes.STRING,
         field : 'org_details_id'   
        },
        grpModuleId:{
            type : DataTypes.STRING,
            field: 'grp_module_id'
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
            tableName : 'tbl_nk_cm_grp_org_modules',
            classMethods: {
                associate: function (Models) {
                    // associations can be defined here
                }
            }
        }); 
    return organisationModuleDetails;
};