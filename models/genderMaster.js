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