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
                is_active: 1
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
}

const saveGroupMaster = async (req, res) => {
    try {
        const groupMaster = req.body;

       
        console.log("Group Master : ",groupMaster);
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
       if(req.user && req.user.id !==null)
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
        if(req.user && req.user.id !==null)
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
            await dal.getList({ model: db.orgRelationTypeMaster, where, order: [['createdAt', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
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

//#region  Module Master
const getModuleMasterById = async (req, res) => {

    try {
        const result = await dal.findById(db.module, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Module Master');
    }
};

const _findModuleWithCode = async (Code, isActive) => {
    const where = {};

    typeof isActive === 'undefined' ? '' : where.active = isActive;
    where.moduleCode = Code;

    const module = await dal.findOne(db.module, where, true);

    return module;
};

const getModuleMasterByGroupId = async (req, res) => {
    try {
        const where = {};
        typeof isActive === 'undefined' ? '' : where.active = isActive;
        where.groupMasterId = req.query.groupId;

        const result = await dal.findOne(db.module, where, true);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting module master data');
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
        where.push(util.constructWheresForSequelize('active', 1));

        if (req.query.id) {
            return getModuleMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.module, where, order: [['createdAt', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Chapter');
    }
};

const getLastModuleOrder = async (isActive) => {
    try {
        const moduleMaster = await db.module.findOne({
            order: [['`order`', 'desc']],
            limit: 1,
            where: {
                active: 1
            },
            attributes: ['order']
        });

        return moduleMaster;
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
const _FindModuleAlreadyExistOrNot = async (id, Code) => {
    let where = [];
    if (id && id !== null && id !== 'undefined') {
        where.push(util.constructWheresForNotEqualSequelize('id', id));
    }
    where.push(util.constructWheresForSequelize('active', 1));
    where.push(util.constructWheresForSequelize('moduleCode', Code));

    const moduleDetails = await dal.getList({ model: db.module, where, order: [['createdAt', 'desc']], include: false, });
    if (moduleDetails && moduleDetails.length > 0) {
        return 'already exist'
    }
    else {
        return 'success'
    }
}



const saveModuleMaster = async (req, res) => {
    try {
        const module = req.body;
        // if (typeof module.id === 'undefined') {
        //     const _ModuleWithCode = await _findModuleWithCode(module.moduleCode, true);
        //     if (module && _ModuleWithCode && module.moduleCode === _ModuleWithCode.moduleCode) throw util.generateWarning('Master Category Code already in use', codes.CODE_ALREADY_EXISTS);
        // }

        const PKID = module && module.id ? module.id : undefined;
        const ChekAlreadyExist = await _FindModuleAlreadyExistOrNot(PKID, module.moduleCode);
        let CodeMsg = module && module.moduleCode ? 'Module  "' + module.moduleCode + '" already in use' : 'module code already in use';
        if (ChekAlreadyExist && ChekAlreadyExist !== "success") throw util.generateWarning(CodeMsg, codes.CODE_ALREADY_EXISTS);

        let lastOrder = 1;
        if (module.order == null) {
            lastOrder = await getLastModuleOrder(true);
            //console.log("lastOrder.Order : ", lastOrder.order);
            if (lastOrder && lastOrder.order)
                module.order = lastOrder.order + 1;
            else
                module.order = 1;
        }
        if (util.missingRequiredFields('', module, res) === '') {
            await dal.saveData(db.module, module, res, req.user.id);
        }
        else {
            console.log("Backend module Data else condition", req)
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'saving module master');
    }
};

const deleteModuleMaster = async (req, res) => {

    try {
        if (!req.query.id) {
            throw util.generateWarning(`Please provide module master id`, codes.ID_NOT_FOUND);
        }
        dal.deleteRecords(db.module, req.query.id, req.user.id, res);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting module master');
    }
};
//#endregion

//#region Role Master
const getRoleMasterById = async (req, res) => {

    try {
        const result = await dal.findById(db.roleMaster, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting role master data');
    }
};

const getRoleMasterByModuleId = async (req, res) => {
    try {
        const where = {};
        typeof isActive === 'undefined' ? '' : where.active = isActive;
        where.moduleId = req.query.moduleId;

        const result = await dal.findOne(db.roleMaster, where, true);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting role master data');
    }
};

const _findRoleWithCode = async (Code, isActive) => {
    const where = {};

    typeof isActive === 'undefined' ? '' : where.active = isActive;
    where.roleCode = Code;
    //where.emailConfirmed = 1;

    const roleMaster = await dal.findOne(db.roleMaster, where, true);

    //console.log('find one: ', user);
    return roleMaster;
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

        // let where = [];
        // where.push(util.constructWheresForSequelize('active', 1));
        let where = [];
        where.push(util.constructWheresForSequelize('active', 1));

        if (req.query.id) {
            return getRoleMasterById(req, res);
        }
        else {
            await dal.getList({ model: db.roleMaster, where, order: [['createdAt', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Chapter');
    }
};

const getLastRoleOrder = async (isActive) => {
    try {
        const roleMaster = await db.roleMaster.findOne({
            order: [['roleOrder', 'desc']],
            limit: 1,
            where: {
                active: 1
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

const _FindRoleAlreadyExistOrNot = async (id, Code) => {
    let where = [];
    if (id && id !== null && id !== 'undefined') {
        where.push(util.constructWheresForNotEqualSequelize('id', id));
    }
    where.push(util.constructWheresForSequelize('active', 1));
    where.push(util.constructWheresForSequelize('roleCode', Code));

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
        // if (typeof roleMaster.id === 'undefined') {
        //     const _RoleWithCode = await _findRoleWithCode(roleMaster.roleCode, true);
        //     if (roleMaster && _RoleWithCode && roleMaster.roleCode === _RoleWithCode.roleCode) throw util.generateWarning('Role Master Code already in use', codes.CODE_ALREADY_EXISTS);
        // }


        const PKID = roleMaster && roleMaster.id ? roleMaster.id : undefined;
        const ChekAlreadyExist = await _FindRoleAlreadyExistOrNot(PKID, roleMaster.roleCode);
        let CodeMsg = roleMaster && roleMaster.roleCode ? 'Role  "' + roleMaster.roleCode + '" already in use' : 'Role code already in use';
        if (ChekAlreadyExist && ChekAlreadyExist !== "success") throw util.generateWarning(CodeMsg, codes.CODE_ALREADY_EXISTS);

        let lastOrder = 0;
        if (roleMaster.roleOrder == null) {
            lastOrder = await getLastRoleOrder(true);
            //console.log("lastOrder : ", lastOrder);
            //console.log("lastOrder.roleOrder : ", lastOrder.roleOrder);
            if (lastOrder && lastOrder.roleOrder)
                roleMaster.roleOrder = lastOrder.roleOrder + 1;
            else
                roleMaster.roleOrder = 1;
        }
        if (util.missingRequiredFields('roleMaster', roleMaster, res) === '') {
            await dal.saveData(db.roleMaster, roleMaster, res, req.user.id);
        }
        else {
            console.log("Backend roleMaster Data else condition", req)
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'saving Role Master');
    }
};

const deleteRoleMaster = async (req, res) => {

    try {
        if (!req.query.id) {
            throw util.generateWarning(`Please provide role id`, codes.ID_NOT_FOUND);
        }
        dal.deleteRecords(db.roleMaster, req.query.id, req.user.id, res);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting Role Master');
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

//#region  Year Master
const getYearMasterById = async (req, res) => {
    try {
        const result = await dal.findById(db.yearMaster, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Module Master');
    }
};

const _findYearWithCode = async (yearName, isActive) => {
    const where = {};

    typeof isActive === 'undefined' ? '' : where.active = isActive;
    where.yearName = yearName;
    const yearMaster = await dal.findOne(db.yearMaster, where, true);

    return yearMaster;
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
        //console.log("eq.query : ", req.query);
        let where = [];
        where.push(util.constructWheresForSequelize('active', 1));
        if (req.query.where) {
            let queryWhere = JSON.parse(req.query.where);
            for (let item of queryWhere) {
                where.push(util.constructWheresForSequelize(item.key, item.value));
            }
        }
        //console.log("Year Master where : ", where)
        if (req.query.id) {
            return getYearMasterById(req, res);
        }
        else {
            let Attribute = {
                include: [
                    [
                        db.sequelize.literal(`(
                            CASE
                                WHEN CURRENT_DATE() BETWEEN startDate AND endDate THEN 1 ELSE 0
                            END
                        )`),
                        'isCurrentYear'
                    ]
                ]
            }

            await dal.getList({ model: db.yearMaster, where, order: [['yearTypeMasterId', 'desc'], ['yearName', 'desc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res, undefined, includedAttributes: Attribute });
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Groups');
    }
};

/**
* 
* @param {*} req 
* @param {*} res  
*/

const _FindYearAlreadyExistOrNot = async (id, yearname, starDate, endDate) => {
    let where = [];
    if (id && id !== null && id !== 'undefined') {
        where.push(util.constructWheresForNotEqualSequelize('id', id));
    }
    where.push(util.constructWheresForSequelize('active', 1));
    where.push(
        util.constructWheresForSequelize('yearName', yearname)
    );

    const where1 = [{
        active: 1,
        yearName: yearname,
        // starDate : {
        //     [Op.between]: [{ starDate: starDate }, { enddate: endDate }],
        // },
        // id: {
        //     [Op.ne] :id
        // }
    }];



    // where.push(util.constructWheresForbetweenSequelize('startDate', starDate, endDate,[starDate,endDate]));
    // where.push(util.constructWheresForbetweenSequelize('endDate', starDate, endDate));

    //console.log("Where Condition of year", where1)
    const yearMasterDetails = await dal.getList({ model: db.yearMaster, where, order: [['createdAt', 'desc']], include: false, });
    if (yearMasterDetails && yearMasterDetails.length > 0) {
        return 'already exist'
    }
    else {
        return 'success'
    }
}

const saveYearMaster = async (req, res) => {
    try {
        const yearMaster = req.body;
        // if (typeof yearMaster.id === 'undefined') {
        //     const _YearWithCode = await _findYearWithCode(yearMaster.yearName, true);
        //     if (yearMaster && _YearWithCode && yearMaster.yearName === _YearWithCode.yearName) throw util.generateWarning('Year already in use', codes.CODE_ALREADY_EXISTS);

        // }
        //console.log("year Master before Save", yearMaster)
        const PKID = yearMaster && yearMaster.id ? yearMaster.id : undefined;
        const ChekAlreadyExist = await _FindYearAlreadyExistOrNot(PKID, yearMaster.yearName, yearMaster.startDate, yearMaster.enddate);
        let CodeMsg = yearMaster && yearMaster.yearName ? 'Year  "' + yearMaster.yearName + '" already in use' : 'Year code already in use';
        if (ChekAlreadyExist && ChekAlreadyExist !== "success") throw util.generateWarning(CodeMsg, codes.CODE_ALREADY_EXISTS);


        if (util.missingRequiredFields('yearMaster', yearMaster, res) === '') {
            await dal.saveData(db.yearMaster, yearMaster, res, req.user.id);
        }
        else {
            console.log("Backend Year Data else condition", req)
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'saving group master details');
    }
};

const deleteYearMaster = async (req, res) => {
    try {
        //console.log("delete group req : ", req);
        if (!req.query.id) {
            throw util.generateWarning(`Please provide Year master id`, codes.ID_NOT_FOUND);
        }
        dal.deleteRecords(db.yearMaster, req.query.id, req.user.id, res);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting group master details');
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


module.exports.saveorgRelationTypeMaster = saveorgRelationTypeMaster;
module.exports.deleteGroupMaster = deleteGroupMaster;
module.exports.getOrgRelationTypeMaster = getOrgRelationTypeMaster;

module.exports.saveGroupMaster = saveGroupMaster;
module.exports.deleteOrgRelationTypeMaster = deleteOrgRelationTypeMaster;
module.exports.getGroupMaster = getGroupMaster;

module.exports.saveAlarmTypeMaster = saveAlarmTypeMaster;
module.exports.deleteAlarmTypeMaster = deleteAlarmTypeMaster;
module.exports.getAlarmTypeMaster = getAlarmTypeMaster;

module.exports.saveModuleMaster = saveModuleMaster;
module.exports.deleteModuleMaster = deleteModuleMaster;
module.exports.getModuleMaster = getModuleMaster;
module.exports.getModuleMasterByGroupId = getModuleMasterByGroupId;

module.exports.saveRoleMaster = saveRoleMaster;
module.exports.deleteRoleMaster = deleteRoleMaster;
module.exports.getRoleMaster = getRoleMaster;
module.exports.getRoleMasterByModuleId = getRoleMasterByModuleId;


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

module.exports.saveYearMaster = saveYearMaster;
module.exports.deleteYearMaster = deleteYearMaster;
module.exports.getYearMaster = getYearMaster;

module.exports.getStatusMaster = getStatusMaster;
module.exports.getStatusMasterById = getStatusMasterById;
module.exports.getplantMasterByCompanyMasterId = getplantMasterByCompanyMasterId;

module.exports.getYearTypeMaster = getYearTypeMaster;
module.exports.getYearTypeMasterById = getYearTypeMasterById;
