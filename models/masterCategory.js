module.exports = function (sequelize, DataTypes) {
    const masterCategory = sequelize.define('masterCategory', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },

        moduleMasterID: DataTypes.STRING,
        masterCategoryName: DataTypes.INTEGER,
        masterCategoryCode: DataTypes.STRING,
        isChildApplicable: DataTypes.BOOLEAN,
        isParentApplicable: DataTypes.BOOLEAN,
        parentMasterCategoryId: DataTypes.STRING,
        componentName: DataTypes.STRING,
        pageName: DataTypes.STRING,
        description: DataTypes.STRING,
        isLinkVisible: DataTypes.BOOLEAN,
        isCommonForAllModule: DataTypes.BOOLEAN,
        order: DataTypes.NUMERIC,
        active: DataTypes.BOOLEAN,
        createdBy: DataTypes.STRING,
        updatedBy: DataTypes.STRING,
    },
        {
            tableName: 'tbl_MasterCategory',
            classMethods: {
                associate: function (Models) {
                    // associations can be defined here
                }
            }
        });

    return masterCategory;
};