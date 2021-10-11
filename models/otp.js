module.exports = function (sequelize, DataTypes) {
    const otp = sequelize.define('otp', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        sentTo: DataTypes.STRING,
        type: DataTypes.STRING,
		userId: DataTypes.STRING,
        requestType: DataTypes.STRING,
        code: DataTypes.STRING,
        otpExpiresAt: DataTypes.DATE
    },
        {
            tableName: 'tbl_OTP',
            classMethods: {
                associate: function (Models) {
                    // associations can be defined here
                }
            }
        });

    return otp;
};