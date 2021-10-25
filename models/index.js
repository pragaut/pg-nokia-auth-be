const Sequelize = require('sequelize');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const basename = path.basename(module.filename);
console.log('==>', config.config.SEQUELIZE);

const sequelize = new Sequelize(config.config.SEQUELIZE);


const db = {};

const authenticate = () => {
    return sequelize.authenticate();
};

// load the models

fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(function (file) {
        var model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

// let's load the subdirector models too

Object.keys(db).forEach(function (modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});


// set up the relationship here

/*** model.belongsTo(anotherModel) ***/
 
db.token.belongsTo(db.user);
db.user.belongsTo(db.accessGroup); 

db.userRole.belongsTo(db.user, { as: 'user', foreignKey: 'userId'});

db.user.hasMany(db.userRole , { foreignKey: 'userId' });

db.userRole.belongsTo(db.roleMaster , { as: 'roleMaster', foreignKey: 'roleId'})
//db.roleMaster.hasOne(db.userRole , { as: 'userRoles', foreignKey: 'roleId' });

//db.module.hasOne(db.roleMaster, { foreignKey: 'moduleMasterId' })
db.yearMaster.belongsTo(db.yearTypeMaster , { as: 'yearType', foreignKey: 'yearTypeMasterId' });
db.companyMaster.belongsTo(db.yearTypeMaster,{as :'yearType',foreignKey:'yearTypeMasterId'});
db.user.belongsTo(db.employeeMaster,{as :'employeeMaster',foreignKey:'employeeId'});
db.orgRelationTypeMaster.belongsTo(db.groupMaster,{as :'group',foreignKey:'groupId'});
db.notificationMaster.belongsTo(db.alarmTypeMaster,{as :'alarmType', foreignKey:'alarmTypeId'});
db.roleMaster.belongsTo(db.moduleMaster,{as :'module', foreignKey:'grpModulesId'});
db.moduleMaster.belongsTo(db.groupMaster,{as :'group', foreignKey:'grpDetailsId'});
// db.module.belongsTo(db.roleMaster);
// db.roleMaster.hasMany(db.module)

// db.userAccess.belongsTo(db.user); 

db.sequelize = sequelize;
db.authenticate = authenticate;

module.exports.db = db;