module.exports = function (sequelize, DataTypes) {
    const organisationDetails = sequelize.define('organisationDetails', {
        id: {
			type: DataTypes.STRING,
			primaryKey: true,
            field : 'org_details_id'
		}, 
        orgRelationTypeId :{
            type : DataTypes.STRING,
            field : 'org_relation_type_id'
        },
        groupId :{
            type : DataTypes.STRING,
            field : 'group_id'
        },
        orgDetailsParentId :{
            type : DataTypes.STRING,
            field : 'org_details_parent_id'
        },
        orgName :{
            type : DataTypes.STRING,
            field : 'org_name'
        },
        orgCode :{
            type : DataTypes.STRING,
            field : 'org_code'
        },
        isParent :{
            type : DataTypes.BOOLEAN,
            field : 'is_parent'
        },
        orgGST :{
            type : DataTypes.STRING,
            field : 'org_gst'
        },
        cityId :{
            type : DataTypes.STRING,
            field : 'city_id'
        },
        regOffAddress :{
            type : DataTypes.STRING,
            field : 'reg_off_address'
        },
        corpOffAddress :{
            type : DataTypes.STRING,
            field : 'corp_off_address'
        },
        email :{
            type : DataTypes.STRING,
            field : 'email'
        },
        phone :{
            type : DataTypes.STRING,
            field : 'phone'
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
    },
        {
            tableName: 'tbl_nk_cm_org_details',
            classMethods: {
                associate: function (Models) {
                    // associations can be defined here
                }
            }
        });

    return organisationDetails;
};