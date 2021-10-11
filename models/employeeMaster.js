module.exports = function (sequelize, DataTypes) {
	const employeeMaster = sequelize.define('employeeMaster', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			field :'employee_id'
		}, 
		orgDetailsId: {
			type : DataTypes.STRING,
			field : 'org_details_id'
		},
		employeeName: {
			type : DataTypes.STRING,
			field : 'employee_name'
		},
		employeeCode: {
			type : DataTypes.STRING,
			field : 'employee_code'
		},
		genderId: {
			type : DataTypes.STRING,
			field : 'gender_id'
		},
		dateOfBirth: {
			type : DataTypes.DATE,
			field : 'date_of_birth'
		},
		fatherName: {
			type : DataTypes.STRING,
			field : 'father_name'
		},
		motherName: {
			type : DataTypes.STRING,
			field : 'mother_name'
		},
		isIndian: {
			type : DataTypes.BOOLEAN,
			field : 'is_indian'
		},
		otherNationality: {
			type : DataTypes.STRING,
			field : 'other_nationality'
		},
		panNumber: {
			type : DataTypes.STRING,
			field : 'pan_number'
		},
		passportNumber: {
			type : DataTypes.STRING,
			field : 'passport_number'
		},
		corrAddress: {
			type : DataTypes.STRING,
			field : 'corr_address'
		},
		permAddress: {
			type : DataTypes.STRING,
			field : 'perm_address'
		},
		email : DataTypes.STRING,
		mobile : DataTypes.STRING,
		isManager: {
			type : DataTypes.BOOLEAN,
			field : 'is_manager'
		},
		managerId: {
			type : DataTypes.STRING,
			field : 'manager_id'
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
			tableName: 'tbl_nk_cm_org_employees',
			classMethods: {
				associate: function (Models) {
					// associations can be defined here
				}
			}
		});

	return employeeMaster;
};