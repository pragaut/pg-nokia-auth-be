module.exports = function (sequelize, DataTypes) {
    const masterDetails = sequelize.define('masterDetails', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },

        masterCategoryID: DataTypes.STRING,
        parentMasterID: DataTypes.STRING,
        value: DataTypes.STRING,
        code: DataTypes.STRING,
        other: DataTypes.STRING,
        order: DataTypes.INTEGER,
        isInoperativeRecord: DataTypes.BOOLEAN, 
        active: DataTypes.BOOLEAN,
        createdBy: DataTypes.STRING,
        updatedBy: DataTypes.STRING,
    },
        {
            tableName: 'tbl_MasterDetails',
            classMethods: {
                associate: function (Models) {
                    // associations can be defined here
                }
            }
        });

    return masterDetails;
};