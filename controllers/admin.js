const { db } = require('../models');
const dal = require('../dal');
const util = require('../util/');
const responseHelper = require('../util/response.helper');
const codes = require('../util/codes').codes;
const Op = require('sequelize').Op;

//#region  Group Master  
const getGroupMasterById = async (req, res) => {
    try {
        const result = await dal.findById(db.groupMaster, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting group master data');
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getGroupMaster = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('isActive', 1));
        if (req.query.id) {
            return getGroupMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.groupMaster, where, order: [['createdAt', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting groups details');
    }
};
const getLastGroupOrder = async (isActive) => {
    try {
        const groupMaster = await db.groupMaster.findOne({
            order: [['`groupOrder`', 'desc']],
            limit: 1,
            where: {
                isActive: 1
            },
            attributes: ['groupOrder']
        });

        return groupMaster;
    }
    catch (error) {
        return undefined;
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
*/

const _FindGroupMasterAlreadyExistOrNot = async (id, Code) => {
    let where = [];
    if (id && id !== null && id !== 'undefined') {
        where.push(util.constructWheresForNotEqualSequelize('id', id));
    }
    where.push(util.constructWheresForSequelize('isActive', 1));
    where.push(util.constructWheresForSequelize('groupCode', Code));

    const groupMasterDetails = await dal.getList({ model: db.groupMaster, where, order: [['createdAt', 'desc']], include: false, });
    if (groupMasterDetails && groupMasterDetails.length > 0) {
        return 'already exist'
    }
    else {
        return 'success'
    }
};
const saveGroupMaster = async (req, res) => {
    try {
        const groupMaster = req.body;


        console.log("Group Master : ", groupMaster);
        const PKID = groupMaster && groupMaster.id ? groupMaster.id : undefined;
        const ChekAlreadyExist = await _FindGroupMasterAlreadyExistOrNot(PKID, groupMaster.groupCode);
        let CodeMsg = groupMaster && groupMaster.groupCode ? 'Group  "' + groupMaster.groupCode + '" already in use' : 'Group code already in use';
        if (ChekAlreadyExist && ChekAlreadyExist !== "success") throw util.generateWarning(CodeMsg, codes.CODE_ALREADY_EXISTS);

        let lastOrder = 0;
        if (groupMaster.groupOrder == null) {
            lastOrder = await getLastGroupOrder(true);
            if (lastOrder && lastOrder.groupOrder)
                groupMaster.groupOrder = lastOrder.groupOrder + 1;
            else
                groupMaster.groupOrder = 1;
        }
        console.log("req : ", req.user);
        if (req.user && req.user.id !== null)
            UserId = req.user.id;
        //-----let primaryKey = 'group_id';
        if (util.missingRequiredFields('groupMaster', groupMaster, res) === '') {
            //----- await dal.saveData(db.groupMaster, groupMaster, res, UserId, undefined, undefined, undefined, primaryKey);
            await dal.saveData(db.groupMaster, groupMaster, res, UserId);
        }
        else {
            console.log("Backend group master Data else condition", req)
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'saving group master details');
    }
};
const deleteGroupMaster = async (req, res) => {
    try {
        if (req.user && req.user.id !== null)
            UserId = req.user.id;
        if (!req.query.id) {
            throw util.generateWarning(`Please provide group master id`, codes.ID_NOT_FOUND);
        }
        dal.deleteRecords(db.groupMaster, req.query.id, UserId, res);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting group master details');
    }
};

//#endregion

//#region  Alarm Type Master  
const getAlarmTypeMasterById = async (req, res) => {
    try {
        const result = await dal.findById(db.alarmTypeMaster, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Alarm Type master data');
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getAlarmTypeMaster = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('isActive', 1));
        if (req.query.id) {
            return getAlarmTypeMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.alarmTypeMaster, where, order: [['createdAt', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting AlarmType details');
    }
};

const getLastAlarmTypeOrder = async (isActive) => {
    try {
        const alarmTypeMaster = await db.alarmTypeMaster.findOne({
            order: [['`alarmTypeOrder`', 'desc']],
            limit: 1,
            where: {
                is_active: 1
            },
            attributes: ['alarmTypeOrder']
        });

        return alarmTypeMaster;
    }
    catch (error) {
        return undefined;
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
*/

const _FindAlarmTypeMasterAlreadyExistOrNot = async (id, Code) => {
    let where = [];
    if (id && id !== null && id !== 'undefined') {
        where.push(util.constructWheresForNotEqualSequelize('id', id));
    }
    where.push(util.constructWheresForSequelize('isActive', 1));
    where.push(util.constructWheresForSequelize('alarmTypeCode', Code));

    const alarmTypeMasterDetails = await dal.getList({ model: db.alarmTypeMaster, where, order: [['createdAt', 'desc']], include: false, });
    if (alarmTypeMasterDetails && alarmTypeMasterDetails.length > 0) {
        return 'already exist'
    }
    else {
        return 'success'
    }
}

const saveAlarmTypeMaster = async (req, res) => {
    try {
        const alarmTypeMaster = req.body;

       
        console.log("Alarm Type Master : ",alarmTypeMaster);
        const PKID = alarmTypeMaster && alarmTypeMaster.id ? alarmTypeMaster.id : undefined;
        const ChekAlreadyExist = await _FindAlarmTypeMasterAlreadyExistOrNot(PKID, alarmTypeMaster.alarmTypeCode);
        let CodeMsg = alarmTypeMaster && alarmTypeMaster.alarmTypeCode ? 'Alarm Type  "' + alarmTypeMaster.alarmTypeCode + '" already in use' : 'Alarm Type code already in use';
        if (ChekAlreadyExist && ChekAlreadyExist !== "success") throw util.generateWarning(CodeMsg, codes.CODE_ALREADY_EXISTS);

        let lastOrder = 0;
        if (alarmTypeMaster.alarmTypeOrder == null) {
            lastOrder = await getLastAlarmTypeOrder(true);
            if (lastOrder && lastOrder.alarmTypeOrder)
            alarmTypeMaster.alarmTypeOrder = lastOrder.alarmTypeOrder + 1;
            else
            alarmTypeMaster.alarmTypeOrder = 1;
        }
    console.log("req : ", req.user);
       if(req.user && req.user.id !==null)
       UserId = req.user.id;
       //-----let primaryKey = 'alarm_type_id';
        if (util.missingRequiredFields('alarmTypeMaster', alarmTypeMaster, res) === '') {
           //----- await dal.saveData(db.alarmTypeMaster, alarmTypeMaster, res, UserId, undefined, undefined, undefined, primaryKey);
            await dal.saveData(db.alarmTypeMaster, alarmTypeMaster, res, UserId);
        }
        else {
            console.log("Backend Alarm Type master Data else condition", req)
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'saving Alarm Type master details');
    }
};

const deleteAlarmTypeMaster = async (req, res) => {
    try {
        if(req.user && req.user.id !==null)
         UserId = req.user.id;
        if (!req.query.id) {
            throw util.generateWarning(`Please provide Alarm Type master id`, codes.ID_NOT_FOUND);
        }
        dal.deleteRecords(db.alarmTypeMaster, req.query.id, UserId, res);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting Alarm Type master details');
    }
};

//#endregion

//#region  Notification Master  
const getNotificationMasterById = async (req, res) => {
    try {
        const result = await dal.findById(db.notificationMaster, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Notification master data');
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getNotificationMaster = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('isActive', 1));
        if (req.query.id) {
            return getNotificationMasterById(req, res);
        }
        else {
            console.log("before getlist : ", where)
            const Result = await dal.getList({ model: db.notificationMaster, where, order: [['createdAt', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
            console.log("after getlist : ", Result)
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Notification details');
    }
};

const getLastNotificationOrder = async (isActive) => {
    try {
        const notificationMaster = await db.notificationMaster.findOne({
            order: [['`notificationOrder`', 'desc']],
            limit: 1,
            where: {
                is_active: 1
            },
            attributes: ['notificationOrder']
        });

        return notificationMaster;
    }
    catch (error) {
        return undefined;
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
*/

const _FindNotificationMasterAlreadyExistOrNot = async (id, Code) => {
    let where = [];
      if (id && id !== null && id !== 'undefined') {
          where.push(util.constructWheresForNotEqualSequelize('id', id));
      }
      where.push(util.constructWheresForSequelize('isActive', 1));
      where.push(util.constructWheresForSequelize('notificationCode', Code));
  
      const notificationMasterDetails = await dal.getList({ model: db.notificationMaster, where, order: [['createdAt', 'desc']], include: false, });
      if (notificationMasterDetails && notificationMasterDetails.length > 0) {
          return 'already exist'
      }
      else {
          return 'success'
      }
      }
  
  const saveNotificationMaster = async (req, res) => {
  try {
          const notificationMaster = req.body;
            
          console.log("Notification Master : ",notificationMaster);
          const PKID = notificationMaster && notificationMaster.id ? notificationMaster.id : undefined;
          const ChekAlreadyExist = await _FindNotificationMasterAlreadyExistOrNot(PKID, notificationMaster.notificationCode);
          let CodeMsg = notificationMaster && notificationMaster.notificationCode ? 'Notification  "' + notificationMaster.notificationCode + '" already in use' : 'Notification code already in use';
          if (ChekAlreadyExist && ChekAlreadyExist !== "success") throw util.generateWarning(CodeMsg, codes.CODE_ALREADY_EXISTS);
  
          let lastOrder = 0;
          if (notificationMaster.notificationOrder == null) {
              lastOrder = await getLastNotificationOrder(true);
              if (lastOrder && lastOrder.notificationOrder)
              notificationMaster.notificationOrder = lastOrder.notificationOrder + 1;
              else
              notificationMaster.notificationOrder = 1;
          }
      console.log("req : ", req.user);
         if(req.user && req.user.id !==null)
         UserId = req.user.id;
         //-----let primaryKey = 'notification_id';
          if (util.missingRequiredFields('notificationMaster', notificationMaster, res) === '') {
             //----- await dal.saveData(db.notificationMaster, notificationMaster, res, UserId, undefined, undefined, undefined, primaryKey);
              await dal.saveData(db.notificationMaster, notificationMaster, res, UserId);
                }
          else {
              console.log("Backend Notification master Data else condition", req)
          }
      }
      catch (error) {
          responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'saving Notification master details');
      }
  };
  
  const deleteNotificationMaster = async (req, res) => {
  try {
          if (req.user && req.user.id !== null)
              UserId = req.user.id;
          if (!req.query.id) {
              throw util.generateWarning(`Please provide Notification master id`, codes.ID_NOT_FOUND);
          }
          dal.deleteRecords(db.notificationMaster, req.query.id, UserId, res);
      }
      catch (error) {
          responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting Notification master details');
      }
  };

  //#endregion

//#region  Module Master  
const getModuleMasterById = async (req, res) => {
    try {
        const result = await dal.findById(db.moduleMaster, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Module master data');
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getModuleMaster = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('isActive', 1));
        if (req.query.id) {
            return getModuleMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.moduleMaster, where, order: [['createdAt', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Module details');
    }
};

// const getLastModuleOrder = async (isActive) => {
//     try {
//         const moduleMaster = await db.moduleMaster.findOne({
//             order: [['`moduleOrder`', 'desc']],
//             limit: 1,
//             where: {
//                 is_active: 1
//             },
//             attributes: ['moduleOrder']
//         });

//         return moduleMaster;
//     }
//     catch (error) {
//         return undefined;
//     }
// };
/**
* 
* @param {*} req 
* @param {*} res 
*/

const _FindModuleMasterAlreadyExistOrNot = async (id, Code) => {
    let where = [];
    if (id && id !== null && id !== 'undefined') {
        where.push(util.constructWheresForNotEqualSequelize('id', id));
    }
    where.push(util.constructWheresForSequelize('isActive', 1));
    where.push(util.constructWheresForSequelize('moduleCode', Code));

    const moduleMasterDetails = await dal.getList({ model: db.moduleMaster, where, order: [['createdAt', 'desc']], include: false, });
    if (moduleMasterDetails && moduleMasterDetails.length > 0) {
        return 'already exist'
    }
    else {
        return 'success'
    }
}

const saveModuleMaster = async (req, res) => {
    try {
        const moduleMaster = req.body;

       
        console.log("Module Master : ",moduleMaster);
        const PKID = moduleMaster && moduleMaster.id ? moduleMaster.id : undefined;
        const ChekAlreadyExist = await _FindModuleMasterAlreadyExistOrNot(PKID, moduleMaster.moduleCode);
        let CodeMsg = moduleMaster && moduleMaster.moduleCode ? 'Module  "' + moduleMaster.moduleCode + '" already in use' : 'Module code already in use';
        if (ChekAlreadyExist && ChekAlreadyExist !== "success") throw util.generateWarning(CodeMsg, codes.CODE_ALREADY_EXISTS);

        // let lastOrder = 0;
        // if (moduleMaster.moduleOrder == null) {
        //     lastOrder = await moduleOrder(true);
        //     if (lastOrder && lastOrder.moduleOrder)
        //     moduleMaster.moduleOrder = lastOrder.moduleOrder + 1;
        //     else
        //     moduleMaster.moduleOrder = 1;
        // }
    console.log("req : ", req.user);
       if(req.user && req.user.id !==null)
       UserId = req.user.id;
       //-----let primaryKey = 'org_modules_id';
        if (util.missingRequiredFields('moduleMaster', moduleMaster, res) === '') {
           //----- await dal.saveData(db.moduleMaster, moduleMaster, res, UserId, undefined, undefined, undefined, primaryKey);
            await dal.saveData(db.moduleMaster, moduleMaster, res, UserId);
        }
        else {
            console.log("Backend Module master Data else condition", req)
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'saving Module master details');
    }
};

const deleteModuleMaster = async (req, res) => {
    try {
        if(req.user && req.user.id !==null)
         UserId = req.user.id;
        if (!req.query.id) {
            throw util.generateWarning(`Please provide Module master id`, codes.ID_NOT_FOUND);
        }
        dal.deleteRecords(db.moduleMaster, req.query.id, UserId, res);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting Module master details');
    }
};

//#endregion

//#region Year Master

const getYearMasterById = async (req, res) => {
    try {
        const result = await dal.findById(db.yearMaster, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Year Master');
    }
};

/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getYearMaster = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('active', 1));
        if (req.query.id) {
            return getYearMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.yearMaster, where, order: [['yearOrder', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Year Type Data');
    }
};

//#endregion

//#region  Role Master  
const getRoleMasterById = async (req, res) => {
    try {
        const result = await dal.findById(db.roleMaster, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Role master data');
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getRoleMaster = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('isActive', 1));
        if (req.query.id) {
            return getRoleMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.roleMaster, where, order: [['createdAt', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Role details');
    }
};

const getLastRoleOrder = async (isActive) => {
    try {
        const roleMaster = await db.roleMaster.findOne({
            order: [['`roleOrder`', 'desc']],
            limit: 1,
            where: {
                is_active: 1
            },
            attributes: ['roleOrder']
        });

        return roleMaster;
    }
    catch (error) {
        return undefined;
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
*/

const _FindRoleMasterAlreadyExistOrNot = async (id, roleName) => {
    let where = [];
    if (id && id !== null && id !== 'undefined') {
        where.push(util.constructWheresForNotEqualSequelize('id', id));
    }
    where.push(util.constructWheresForSequelize('isActive', 1));
    where.push(util.constructWheresForSequelize('roleName', roleName));

    const roleMasterDetails = await dal.getList({ model: db.roleMaster, where, order: [['createdAt', 'desc']], include: false, });
    if (roleMasterDetails && roleMasterDetails.length > 0) {
        return 'already exist'
    }
    else {
        return 'success'
    }
}

const saveRoleMaster = async (req, res) => {
    try {
        const roleMaster = req.body;

       
        console.log("Role Master : ",roleMaster);
        const PKID = roleMaster && roleMaster.id ? roleMaster.id : undefined;
        const ChekAlreadyExist = await _FindRoleMasterAlreadyExistOrNot(PKID, roleMaster.roleName);
        let CodeMsg = roleMaster && roleMaster.roleName ? 'Role  "' + roleMaster.roleName + '" already in use' : 'Role Name already in use';
      if (ChekAlreadyExist && ChekAlreadyExist !== "success") throw util.generateWarning(CodeMsg, codes.CODE_ALREADY_EXISTS);
      console.log("req : ", req.user);
      let lastOrder = 0;
      if (roleMaster.roleOrder == null) {
          lastOrder = await getLastRoleOrder(true);
          if (lastOrder && lastOrder.roleOrder)
          roleMaster.roleOrder = lastOrder.roleOrder + 1;
          else
          roleMaster.roleOrder = 1;
        }
    console.log("req : ", req.user);
       if(req.user && req.user.id !==null)
       UserId = req.user.id;
       //-----let primaryKey = 'role_id';
        if (util.missingRequiredFields('roleMaster', roleMaster, res) === '') {
           //----- await dal.saveData(db.roleMaster, roleMaster, res, UserId, undefined, undefined, undefined, primaryKey);
            await dal.saveData(db.roleMaster, roleMaster, res, UserId);
        }
        else {
            console.log("Backend Role master Data else condition", req)
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'saving Role master details');
    }
};

const deleteRoleMaster = async (req, res) => {
    try {
        if(req.user && req.user.id !==null)
         UserId = req.user.id;
        if (!req.query.id) {
            throw util.generateWarning(`Please provide Role master id`, codes.ID_NOT_FOUND);
        }
        dal.deleteRecords(db.roleMaster, req.query.id, UserId, res);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting Role master details');
    }
};

//#endregion

//#region  Org Relation Type Master


const getOrgRelationTypeMasterById = async (req, res) => {
    try {
        const result = await dal.findById(db.orgRelationTypeMaster, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting org relation type master data');
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getOrgRelationTypeMaster = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('isActive', 1));
        if (req.query.id) {
            return getOrgRelationTypeMasterById(req, res);
        }
        else {
            console.log("before getlist : ", where)
           const Result = await dal.getList({ model: db.orgRelationTypeMaster, where, order: [['createdAt', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
           console.log("after getlist : ", Result)
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting org relation type master details');
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
*/

const _FindorgRelationTypeAlreadyExistOrNot = async (id,groupId, orgRelationType) => {
    let where = [];
    if (id && id !== null && id !== 'undefined') {
        where.push(util.constructWheresForNotEqualSequelize('id', id));
    }
    where.push(util.constructWheresForSequelize('isActive', 1));
    where.push(util.constructWheresForSequelize('groupId', groupId));
    where.push(util.constructWheresForSequelize('orgRelationType', orgRelationType));
    const orgRelationTypeMasterDetails = await dal.getList({ model: db.orgRelationTypeMaster, where, order: [['createdAt', 'desc']], include: false, });
    if (orgRelationTypeMasterDetails && orgRelationTypeMasterDetails.length > 0) {
        return 'already exist'
    }
    else {
        return 'success'
    }
}

const saveorgRelationTypeMaster = async (req, res) => {
    try {
        const orgRelationTypeMaster = req.body;

       
        console.log("Organisation Relation Type Master : ",orgRelationTypeMaster);
        const PKID = orgRelationTypeMaster && orgRelationTypeMaster.id ? orgRelationTypeMaster.id : undefined;
        const ChekAlreadyExist = await _FindorgRelationTypeAlreadyExistOrNot(PKID, orgRelationTypeMaster.groupId, orgRelationTypeMaster.orgRelationType);
        let CodeMsg = orgRelationTypeMaster && orgRelationTypeMaster.orgRelationType ? 'Relation Type  "' + orgRelationTypeMaster.orgRelationType + '" already in use' : 'Org relation type already in use';
        if (ChekAlreadyExist && ChekAlreadyExist !== "success") throw util.generateWarning(CodeMsg, codes.CODE_ALREADY_EXISTS);

       if(req.user && req.user.id !==null)
       UserId = req.user.id;
        if (util.missingRequiredFields('orgRelationTypeMaster', orgRelationTypeMaster, res) === '') {
            await dal.saveData(db.orgRelationTypeMaster, orgRelationTypeMaster, res, UserId);
        }
        else {
            console.log("Backend oeg relation type master Data else condition", req)
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'saving org relation type master details');
    }
};

const deleteOrgRelationTypeMaster = async (req, res) => {
    try {
        if(req.user && req.user.id !==null)
         UserId = req.user.id;
        if (!req.query.id) {
            throw util.generateWarning(`Please provide org relation type master id`, codes.ID_NOT_FOUND);
        }
        dal.deleteRecords(db.orgRelationTypeMaster, req.query.id, UserId, res);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting org relation type master details');
    }
};

//#endregion

//#region Group Company Master
const getCompanyMasterById = async (req, res) => {

    try {
        const result = await dal.findById(db.companyMaster, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Group Company master data');
    }
};

const getCompanyMasterByGroupMasterId = async (req, res) => {
    try {
        const where = [];
        where.push(util.constructWheresForSequelize('active', 1));
        if (req.query.groupMasterID && req.query.groupMasterID !== null && req.query.groupMasterID !== 'undefined') {
            where.push(util.constructWheresForSequelize('groupMasterID', req.query.groupMasterID));
        }

        // typeof isActive === 'undefined' ? '' : where.active = isActive;
        // where.groupMasterID = req.query.groupMasterID;
        console.log("where", where);
        await dal.getList({ model: db.companyMaster, where, order: [['createdAt', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });

        //  const result = await dal.findOne(db.groupCompanyMaster, where, true);

        // responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Group Company master data');
    }
};

const _findCompanyMasterWithCode = async (Code, isActive) => {
    const where = {};

    typeof isActive === 'undefined' ? '' : where.active = isActive;
    where.companyCode = Code;
    //where.emailConfirmed = 1;

    const groupCompanyMaster = await dal.findOne(db.companyMaster, where, true);

    //console.log('find one: ', user);
    return groupCompanyMaster;
};

/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getCompanyMaster = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('active', 1));
        if (req.query.where) {
            let queryWhere = JSON.parse(req.query.where);
            for (let item of queryWhere) {
                where.push(util.constructWheresForSequelize(item.key, item.value));
            }
        }
        if (req.query.id) {
            return getCompanyMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.companyMaster, where, order: [['createdAt', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Group Company');
    }
};

/**
* 
* @param {*} req 
* @param {*} res   
*/

const _FindCompanyAlreadyExistOrNot = async (id, Code, Name) => {
    //let where = [];
    let where = {};
    if (id && id !== null && id !== 'undefined') {
        where = {
            [Op.or]: [{ companyCode: Code }, { companyName: Name }],
            active: 1,
            id: {
                [Op.ne]: id
            }
        };
    }
    else {
        where = {
            [Op.or]: [{ companyCode: Code }, { companyName: Name }],
            active: 1
        };
    }
    const include = [{
        model: db.yearTypeMaster, foreignKey: 'yearTypeMasterId', as: 'yearType',
        where: {
            active: 1
        },
        required: true
    }
    ];
    const companyMasterDetails = await dal.findOne(db.companyMaster, where, true, include);
    if (companyMasterDetails && companyMasterDetails !== null) {
        return 'already exist'
    }
    else {
        return 'success'
    }
}

const saveCompanyMaster = async (req, res) => {
    try {
        const CompanyMaster = req.body;
        // if (typeof CompanyMaster.id === 'undefined') {
        //     const _CompanyMasterWithCode = await _findCompanyMasterWithCode(CompanyMaster.companyCode, true);
        //     if (CompanyMaster && _CompanyMasterWithCode && CompanyMaster.companyCode === _CompanyMasterWithCode.companyCode) throw util.generateWarning('Group Company Master Code already in use', codes.CODE_ALREADY_EXISTS);

        // }

        const PKID = CompanyMaster && CompanyMaster.id ? CompanyMaster.id : undefined;
        const ChekAlreadyExist = await _FindCompanyAlreadyExistOrNot(PKID, CompanyMaster.companyCode, CompanyMaster.companyName);
        let CodeMsg = CompanyMaster && CompanyMaster.companyCode ? 'Company already exist! pls check code or name ' : 'Company code already in use';
        if (ChekAlreadyExist && ChekAlreadyExist !== "success") throw util.generateWarning(CodeMsg, codes.CODE_ALREADY_EXISTS);



        if (util.missingRequiredFields('CompanyMaster', CompanyMaster, res) === '') {
            await dal.saveData(db.companyMaster, CompanyMaster, res, req.user.id);
        }
        else {
            console.log("Backend Group Company Data else condition", req)
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'saving Group Company Master');
    }
};

const deleteCompanyMaster = async (req, res) => {

    try {
        if (!req.query.id) {
            throw util.generateWarning(`Please provide group company id`, codes.ID_NOT_FOUND);
        }
        dal.deleteRecords(db.companyMaster, req.query.id, req.user.id, res);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting Group Company Master');
    }
};
//#endregion

//#region  Company Plant Master
const getplantMasterById = async (req, res) => {

    try {
        const result = await dal.findById(db.plantMaster, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Group Company master data');
    }
};

const getplantMasterByGroupCompanyMasterId = async (req, res) => {
    try {
        const where = {};
        typeof isActive === 'undefined' ? '' : where.active = isActive;
        where.companyMasterID = req.query.companyMasterID;

        const result = await dal.findOne(db.plantMaster, where, true);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Group Company master data');
    }
};


const getplantMasterByCompanyMasterId = async (req, res) => {
    try {
        // const where = {};
        // typeof isActive === 'undefined' ? '' : where.active = isActive;
        // where.companyMasterID = req.query.companyMasterID;

        // const result = await dal.findOne(db.plantMaster, where, true);
        let where = [];
        where.push(util.constructWheresForSequelize('active', 1));
        where.push(util.constructWheresForSequelize('companyMasterID', req.query.companyMasterID));
        await dal.getList({ model: db.plantMaster, where, order: [['createdAt', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });

        // responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Group Company master data');
    }
};
const getPlantsByCompanyMasterId = async (req, res) => {
    try {
        //console.log("req plant by company id  : ", req.query);
        const include = [{
            model: db.userRole, as: 'userRoles',
            where: {
                active: 1
            },
            required: false,
        },

        ];

        let where = [];
        where.push(util.constructWheresForSequelize('active', 1));
        if (req.query.companyMasterID) {
            where.push(
                { key: 'companyMasterID', type: 'in', value: JSON.parse(req.query.companyMasterID), value2: '' }
            )
        }
        //console.log("where plant : ", where);
        if (req.query.id) {
            return getplantMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.plantMaster, where, order: [['createdAt', 'desc']], include, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Group Company master data');
    }
};


const getPlantByCompanyID_UsingProcedure = async (req, res) => {
    try {
        let where = [];
        console.log("req", req.query)
        where.push(util.constructWheresForSequelize('active', 1));
        db.sequelize.query('call Asp_HRA_GetPlantDetails_For_SelfAuditPlanning(:pCompanyMasterId, :pYearMasterId,:pFromDate,:pToDate,:validationType)', {
            replacements: {
                pCompanyMasterId: req.query.companyMasterID ? req.query.companyMasterID : '',
                pYearMasterId: req.query.yearMasterId ? req.query.yearMasterId : '',
                pFromDate: req.query.auditFromDate ? req.query.auditFromDate : null,
                pToDate: req.query.auditToDate ? req.query.auditToDate : null,
                validationType: req.query.validationType ? req.query.validationType : ''
            }
        }).then(results => {
            responseHelper.success(res, 200, results, 'Plant list get successfully', '-1', results.length);
        }).catch(err => {
            responseHelper.error(res, err.code ? err.code : codes.ERROR, err, 'Error in Plant list details');

        });
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting plant details');
    }
};


const _findplantMasterWithCode = async (Code, companyMasterId, isActive) => {
    const where = {};

    typeof isActive === 'undefined' ? '' : where.active = isActive;
    where.plantCode = Code;
    where.companyMasterId = companyMasterId;
    //where.emailConfirmed = 1;

    const plantMaster = await dal.findOne(db.plantMaster, where, true);

    //console.log('find one: ', user);
    return plantMaster;
};

/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getplantMaster = async (req, res) => {
    try {

        const include = [{
            model: db.userRole, as: 'userRoles',
            where: {
                active: 1
            },
            required: true,
        }];

        let where = [];
        where.push(util.constructWheresForSequelize('active', 1));
        if (req.query.id) {
            return getplantMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.plantMaster, where, order: [['createdAt', 'desc']], include, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Group Company');
    }
};

/**
* 
* @param {*} req 
* @param {*} res  

*/

const _FindPlantAlreadyExistOrNot_old = async (id, Code) => {
    let where = [];
    if (id && id !== null && id !== 'undefined') {
        where.push(util.constructWheresForNotEqualSequelize('id', id));
    }

    where.push(util.constructWheresForSequelize('active', 1));
    where.push(util.constructWheresForSequelize('plantCode', Code));

    const plantMasterDetails = await dal.getList({ model: db.plantMaster, where, order: [['createdAt', 'desc']], include: false, });
    if (plantMasterDetails && plantMasterDetails.length > 0) {
        return 'already exist'
    }
    else {
        return 'success'
    }
}

const _FindPlantAlreadyExistOrNot = async (id, Code, Name) => {

    let where = {};
    if (id && id !== null && id !== 'undefined') {
        where = {
            [Op.or]: [{ plantCode: Code }, { plantName: Name }],
            active: 1,
            id: {
                [Op.ne]: id
            }
        };
    }
    else {
        where = {
            [Op.or]: [{ plantCode: Code }, { plantName: Name }],
            active: 1
        };
    }
    const include = [{
        model: db.companyMaster, foreignKey: 'companyMasterID', as: 'GroupCompany',
        where: {
            active: 1
        },
        required: true
    }
    ];
    const plantMasterDetails = await dal.findOne(db.plantMaster, where, true, include);
    // where.push(util.constructWheresForSequelize('active', 1));
    // where.push(util.constructWheresForSequelize('plantCode', Code));

    //const plantMasterDetails = await dal.getList({ model: db.plantMaster, where, order: [['createdAt', 'desc']], include: false, });
    if (plantMasterDetails && plantMasterDetails !== null) {
        return 'already exist'
    }
    else {
        return 'success'
    }
}


const saveplantMaster = async (req, res) => {
    try {
        const plantMaster = req.body;

        const PKID = plantMaster && plantMaster.id ? plantMaster.id : undefined;
        const ChekAlreadyExist = await _FindPlantAlreadyExistOrNot(PKID, plantMaster.plantCode, plantMaster.plantName);
        let CodeMsg = plantMaster && plantMaster.plantCode ? 'Plant already exist!. check plant code and name is there already exist or not' : 'plant code already in use';
        if (ChekAlreadyExist && ChekAlreadyExist !== "success") throw util.generateWarning(CodeMsg, codes.CODE_ALREADY_EXISTS);

        // if (typeof plantMaster.id === 'undefined') {
        //     const _CompanyPlantWithCode = await _findplantMasterWithCode(plantMaster.plantCode, plantMaster.companyMasterID, true);
        //     if (plantMaster && _CompanyPlantWithCode && plantMaster.plantCode === _CompanyPlantWithCode.plantCode) throw util.generateWarning('Company Plant Master Code already in use', codes.CODE_ALREADY_EXISTS);

        // }
        if (util.missingRequiredFields('plantMaster', plantMaster, res) === '') {
            await dal.saveData(db.plantMaster, plantMaster, res, req.user.id);
        }
        else {
            console.log("Backend Group Company Data else condition", req)
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'saving Group Company Master');
    }
};

const deleteplantMaster = async (req, res) => {

    try {
        if (!req.query.id) {
            throw util.generateWarning(`Please provide Company Plant id`, codes.ID_NOT_FOUND);
        }
        dal.deleteRecords(db.plantMaster, req.query.id, req.user.id, res);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting Group Company Master');
    }
};
//#endregion

//#region Year Type Master

const getYearTypeMasterById = async (req, res) => {
    try {
        const result = await dal.findById(db.yearTypeMaster, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Year Type Master');
    }
};

/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getYearTypeMaster = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('active', 1));
        if (req.query.id) {
            return getYearTypeMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.yearTypeMaster, where, order: [['yearTypeOrder', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Year Type Data');
    }
};

//#endregion

//#region Status Master

const getStatusMasterById = async (req, res) => {
    try {
        const result = await dal.findById(db.statusMaster, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Status Master');
    }
};

const getStatusMaster = async (req, res) => {
    try {
        //console.log("getDueDaysMaster");
        let where = [];
        where.push(util.constructWheresForSequelize('active', 1));
        if (req.query.category) {
            where.push(util.constructWheresForSequelize('category', req.query.category));
        }
        if (req.query.id) {
            return getStatusMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.statusMaster, where, order: [['createdAt', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Status Master');
    }
};
//#endregion


//#region  Country  Master  
const getCountryMasterById = async (req, res) => {
    try {
        const result = await dal.findById(db.countryMaster, req.query.id);
        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting country master data');
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getCountryMaster = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('isActive', 1));
        if (req.query.id) {
            return getCountryMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.countryMaster, where, order: [['countryName', 'Asc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting country details');
    }
};

//#endregion

//#region  State  Master  
const getStateMasterById = async (req, res) => {
    try {
        const result = await dal.findById(db.stateMaster, req.query.id);
        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting state master data');
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getStateMaster = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('isActive', 1));
        if (req.query.countryId) {
            where.push(util.constructWheresForSequelize('countryId', req.query.countryId));
        }
        if (req.query.id) {
            return getStateMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.stateMaster, where, order: [['stateName', 'Asc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting state details');
    }
};

//#endregion

//#region  City  Master  
const getCityMasterById = async (req, res) => {
    try {
        const result = await dal.findById(db.cityMaster, req.query.id);
        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting city master data');
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getCityMaster = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('isActive', 1));
        if (req.query.stateId) {
            where.push(util.constructWheresForSequelize('stateId', req.query.stateId));
        }
        if (req.query.id) {
            return getCityMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.cityMaster, where, order: [['cityName', 'Asc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting city details');
    }
};

//#endregion

//#region  Gender  Master  

const getGenderMasterById = async (req, res) => {
    try {
        const result = await dal.findById(db.genderMaster, req.query.id);
        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting gender master data');
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getGenderMaster = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('isActive', 1));
        if (req.query.id) {
            return getGenderMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.genderMaster, where, order: [['genderName', 'Asc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting gender details');
    }
};

//#endregion

//#region  Organisation Details Master  
const getOrganisationDetailsById = async (req, res) => {
    try {
        const result = await dal.findById(db.organisationDetails, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Organisation Details');
    }
};
const _findOrganisationDetailsId = async (orgName, orgRelationTypeId, groupId, orgDetailsParentId, isActive, id) => {
    let where = [];
    if (id && id !== null && id !== 'undefined') {
        where.push(util.constructWheresForNotEqualSequelize('id', id));
    }
    where.push(util.constructWheresForSequelize('isActive', 1));
    if(orgName)
    {
        where.push(util.constructWheresForSequelize('orgName', orgName));
    }
    if(orgRelationTypeId)
    {
        where.push(util.constructWheresForSequelize('orgRelationTypeId', orgRelationTypeId));
    }
    if(groupId)
    {
        where.push(util.constructWheresForSequelize('groupId', groupId));
    }
    if(orgDetailsParentId)
    {
        where.push(util.constructWheresForSequelize('orgDetailsParentId', orgDetailsParentId));
    }   
    console.log('_findOrganisationDetailsId db : ',db)
    const OrganisationDetailsre = await dal.getList({ model: db.organisationDetails, where, order: [['createdAt', 'desc']], include: false, });
    console.log('OrganisationDetails Details : ',OrganisationDetailsre);
    if (OrganisationDetailsre && OrganisationDetailsre.length > 0) {
        return 'already exist'
    }
    else {
        return 'success'
    }
};
const getOrganisationDetails = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('isActive', 1));


        if (req.query.id) {
            return getOrganisationDetailsById(req, res);
        }
        else {
            db.sequelize.query('call asp_nk_cm_org_details_get_org_details(:p_org_details_id, :p_org_relation_type_id, :p_group_id, :p_org_details_parent_id)',
                {
                    replacements: {
                        p_org_details_id: req.query.id ? req.query.id : '',
                        p_org_relation_type_id: req.query.orgRelationTypeId ? req.query.orgRelationTypeId : '',
                        p_group_id: req.query.groupId ? req.query.groupId : '',
                        p_org_details_parent_id: req.query.orgDetailsParentId ? req.query.orgDetailsParentId : '',
                    }
                }).then(results => {
                    responseHelper.success(res, 200, results, 'Organisation Details List got successfully', '-1', results.length);
                }).catch(err => {
                    responseHelper.error(res, err.code ? err.code : codes.ERROR, err, 'Error in Organisation Details');

                });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Organisation Details');
    }
};
const saveOrganisationDetails = async (req, res) => {
    try {
        const OrganisationDetails = req.body;
        let PKID = OrganisationDetails && OrganisationDetails.id ? OrganisationDetails.id : undefined;
        const ChekAlreadyExist = await _findOrganisationDetailsId(OrganisationDetails.orgName,OrganisationDetails.orgRelationTypeId, OrganisationDetails.groupId, OrganisationDetails.orgDetailsParentId, true, PKID)
        if (ChekAlreadyExist && ChekAlreadyExist !== "success") throw util.generateWarning('Organisation Details  already in use', codes.CODE_ALREADY_EXISTS);

        if (util.missingRequiredFields('OrganisationDetails', OrganisationDetails, res) === '') {
            await dal.saveData(db.organisationDetails, OrganisationDetails, res, req.user.id);
        }
        else {
            console.log("Backend organisation Details Data else condition", req)
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'saving organisation Details');
    }
};
const deleteOrganisationDetails = async (req, res) => {
    try {
        //console.log("delete Due Day req : ", req);
        if (!req.query.id) {
            throw util.generateWarning(`Please provide organisation id`, codes.ID_NOT_FOUND);
        }
        dal.deleteRecords(db.organisationDetails, req.query.id, req.user.id, res);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting organisation Details');
    }
};
//#endregion


module.exports.saveorgRelationTypeMaster = saveorgRelationTypeMaster;
module.exports.deleteOrgRelationTypeMaster = deleteOrgRelationTypeMaster;
module.exports.getOrgRelationTypeMaster = getOrgRelationTypeMaster;

module.exports.saveGroupMaster = saveGroupMaster;
module.exports.deleteGroupMaster = deleteGroupMaster;
module.exports.getGroupMaster = getGroupMaster;

module.exports.saveAlarmTypeMaster = saveAlarmTypeMaster;
module.exports.deleteAlarmTypeMaster = deleteAlarmTypeMaster;
module.exports.getAlarmTypeMaster = getAlarmTypeMaster;

module.exports.saveNotificationMaster = saveNotificationMaster;
module.exports.deleteNotificationMaster = deleteNotificationMaster;
module.exports.getNotificationMaster = getNotificationMaster;

module.exports.saveModuleMaster = saveModuleMaster;
module.exports.deleteModuleMaster = deleteModuleMaster;
module.exports.getModuleMaster = getModuleMaster;

module.exports.getYearMaster = getYearMaster;
module.exports.getYearMasterById = getYearMasterById;

module.exports.saveRoleMaster = saveRoleMaster;
module.exports.deleteRoleMaster = deleteRoleMaster;
module.exports.getRoleMaster = getRoleMaster;

module.exports.saveCompanyMaster = saveCompanyMaster;
module.exports.deleteCompanyMaster = deleteCompanyMaster;
module.exports.getCompanyMaster = getCompanyMaster;
module.exports.getCompanyMasterByGroupMasterId = getCompanyMasterByGroupMasterId;


module.exports.saveplantMaster = saveplantMaster;
module.exports.deleteplantMaster = deleteplantMaster;
module.exports.getplantMaster = getplantMaster;
//module.exports.getplantMasterByGroupCompanyMasterId = getplantMasterByGroupCompanyMasterId;
module.exports.getplantMasterByGroupCompanyMasterId = getPlantsByCompanyMasterId;
module.exports.getPlantByCompanyID_UsingProcedure = getPlantByCompanyID_UsingProcedure;

module.exports.getStatusMaster = getStatusMaster;
module.exports.getStatusMasterById = getStatusMasterById;
module.exports.getplantMasterByCompanyMasterId = getplantMasterByCompanyMasterId;

module.exports.getYearTypeMaster = getYearTypeMaster;
module.exports.getYearTypeMasterById = getYearTypeMasterById;

module.exports.getCountryMaster = getCountryMaster;
module.exports.getStateMaster = getStateMaster;
module.exports.getCityMaster = getCityMaster;
module.exports.getGenderMaster = getGenderMaster;

module.exports.getOrganisationDetails = getOrganisationDetails;
module.exports.saveOrganisationDetails = saveOrganisationDetails;
module.exports.deleteOrganisationDetails = deleteOrganisationDetails;
