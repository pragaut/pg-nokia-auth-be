const db = require('../models').db;
const dal = require('../dal');
const Op = require('sequelize').Op;
const util = require('../util/');

module.exports.findGroupAccessToModule = async (accessGroupId, moduleName) => {
    // find a record

    const where = [];

    where.push(util.constructWheresForSequelize('accessGroupId', accessGroupId));
    where.push(util.constructWheresForSequelize('moduleName', moduleName));
    where.push(util.constructWheresForSequelize('active', true));

    const access = await dal.getList({ model: db.groupAccess, where });


    if (access && access.length > 0) {
        return access[0]
    }

    return null;
};


module.exports.assignGroupAccessToModule = async (accessGroupId, moduleName, access, requestorId) => {
    const _access = await exports.findGroupAccessToModule(accessGroupId, moduleName);
    const dataToSave = {
        moduleName,
        accessGroupId,
        access,
        active: true,
    };

    if (_access) {
        // ok the record already exists, let's just update
        dataToSave.id = _access.id;
    }

    return await dal.saveData(db.groupAccess, dataToSave, null, requestorId);
};
