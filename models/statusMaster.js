module.exports = function (sequelize, DataTypes) {
	const statusMaster = sequelize.define('statusMaster', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		}, 
        moduleId: DataTypes.STRING,
        category:DataTypes.STRING,
        statusName: DataTypes.STRING,	
        statusCode: DataTypes.STRING,
        description: DataTypes.STRING,	
        isAccepted: DataTypes.BOOLEAN ,
		isRejected: DataTypes.BOOLEAN,
		isSentBack: DataTypes.BOOLEAN,
		isWIP:DataTypes.BOOLEAN,
		isPending:DataTypes.BOOLEAN,
        isPermanentRejected: DataTypes.BOOLEAN,

		active: DataTypes.BOOLEAN,
        createdBy: DataTypes.STRING,
		//updatedBy: DataTypes.STRING
	},
		{
			tableName: 'tbl_StatusMaster',
			classMethods: {
				associate: function (Models) {
					// associations can be defined here
				}
			}
		});

	return statusMaster;
};