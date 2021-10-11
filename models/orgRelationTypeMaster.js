module.exports = function (sequelize, DataTypes) {
    const orgRelationTypeMaster = sequelize.define('orgRelationTypeMaster', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            field:'org_relation_type_id'
        },
        groupId: {
			type : DataTypes.STRING,
			field : 'group_id'
		},
        orgRelationType: {
			type : DataTypes.STRING,
			field : 'org_relation_type'
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
            tableName: 'tbl_nk_cm_org_relation_type',
            classMethods: {
                associate: function (Models) {
                    // associations can be defined here
                }
            }
        });

    return orgRelationTypeMaster;
};