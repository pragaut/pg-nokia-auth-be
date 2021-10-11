const { db } = require('../models');
const dal = require('../dal');
const util = require('../util/');

module.exports.findUserAccessToModule = async (userId, moduleName) => {
  // find a record

  const where = [];

  where.push(util.constructWheresForSequelize('userId', userId));
  where.push(util.constructWheresForSequelize('moduleName', moduleName));
  where.push(util.constructWheresForSequelize('active', true));

  const access = await dal.getList({ model: db.userAccess, where });

  if (access && access.length > 0) {
    return access[0];
  }

  return null;
};


module.exports.assignUserAccessToModule = async (userId, moduleName, access, requestorId) => {
  const userAccessToModule = await exports.findUserAccessToModule(userId, moduleName);
  const dataToSave = {
    moduleName,
    userId,
    access,
    active: true,
  };

  if (userAccessToModule) {
    // ok the record already exists, let's just update
    dataToSave.id = userAccessToModule.id;
  }

  await dal.saveData(db.userAccess, dataToSave, null, requestorId);
  return;
};


//
