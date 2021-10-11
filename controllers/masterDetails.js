const { db } = require('../models');
const dal = require('../dal');
const util = require('../util/');
const responseHelper = require('../util/response.helper');
const codes = require('../util/codes').codes;


const getMasterDetailsById = async (req, res) => {

    try {
        const result = await dal.findById(db.masterDetails, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting master Details');
    }
};

const getLastOrder = async (masterCategoryID) => {
    try {
        const roleMaster = await db.masterDetails.findOne({
            order: [['order', 'desc']],
            limit: 1,
            where: {
                active: 1,
                masterCategoryID: masterCategoryID
            },
            attributes: ['order']
        });

        return roleMaster;
    }
    catch (error) {
        return undefined;
    }
};

const _findMasterDetailsWithCode = async (id, Code, masterCategoryID, isActive) => {
    const where = {};

    typeof isActive === 'undefined' ? '' : where.active = isActive;
    if (id !== undefined && id !== 'undefined') {
        where.id = id;
    }
    where.code = Code;
    where.masterCategoryID = masterCategoryID;
    //where.emailConfirmed = 1;
    //console.log("Where", where);
    const masterDetails = await dal.findOne(db.masterDetails, where, true);

    //console.log('find one: ', user);
    return masterDetails;
};

const _FindMasterDetailsAlreadyExistOrNot = async (id, Code, masterCategoryID, isActive) => {
    let where = [];
    if (id && id !== null && id !== 'undefined') {
        where.push(util.constructWheresForNotEqualSequelize('id', id));
    }
    where.push(util.constructWheresForSequelize('active', 1));
    where.push(util.constructWheresForSequelize('masterCategoryID', masterCategoryID));
    where.push(util.constructWheresForSequelize('code', Code));

    const masterDetails = await dal.getList({ model: db.masterDetails, where, order: [['createdAt', 'desc']], include: false, });
    if (masterDetails && masterDetails.length > 0) {
        return 'already exist'
    }
    else {
        return 'success'
    }
}


/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getMasterDetails = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('active', 1));
        if (req.query.id) {
            return getMasterDetailsById(req, res);
        }
        else if (req.query.masterCategoryId) {
            db.sequelize.query('call Asp_MasterDetails_Get_MasterDetails(:MasterDetailsID, :MasterCategoryID, :ParentMasterDetailsID, :MasterCategoryCode, :MasterDetailsCode, :ParentMasterCategoryCode, :ParentMasterDetailsCode)', { replacements: { MasterDetailsID: '', MasterCategoryID: req.query.masterCategoryId, ParentMasterDetailsID: '', MasterCategoryCode: '', MasterDetailsCode: '', ParentMasterCategoryCode: '', ParentMasterDetailsCode: '' } }).then(results => {
                responseHelper.success(res, 200, results, 'Master Category List successfully', '-1', results.length);
            }).catch(err => {
                responseHelper.error(res, err.code ? err.code : codes.ERROR, err, 'Error in Master Category List  details');

            });
        }
        else if (req.query.masterCategoryCode) {
            db.sequelize.query('call Asp_MasterDetails_Get_MasterDetails(:MasterDetailsID, :MasterCategoryID, :ParentMasterDetailsID, :MasterCategoryCode, :MasterDetailsCode, :ParentMasterCategoryCode, :ParentMasterDetailsCode)', { replacements: { MasterDetailsID: '', MasterCategoryID: '', ParentMasterDetailsID: '', MasterCategoryCode: req.query.masterCategoryCode, MasterDetailsCode: '', ParentMasterCategoryCode: '', ParentMasterDetailsCode: '' } }).then(results => {
                responseHelper.success(res, 200, results, 'Master Category List successfully', '-1', results.length);
            }).catch(err => {
                responseHelper.error(res, err.code ? err.code : codes.ERROR, err, 'Error in Master Category List  details');
            });
        }
        else {
            db.sequelize.query('call Asp_MasterDetails_Get_MasterDetails(:MasterDetailsID, :MasterCategoryID, :ParentMasterDetailsID, :MasterCategoryCode, :MasterDetailsCode, :ParentMasterCategoryCode, :ParentMasterDetailsCode)', { replacements: { MasterDetailsID: '', MasterCategoryID: '', ParentMasterDetailsID: '', MasterCategoryCode: '', MasterDetailsCode: '', ParentMasterCategoryCode: '', ParentMasterDetailsCode: '' } }).then(results => {
                responseHelper.success(res, 200, results, 'Master Category List successfully', '-1', results.length);
            }).catch(err => {
                responseHelper.error(res, err.code ? err.code : codes.ERROR, err, 'Error in Master Category List  details');

            });
        }
        // await dal.getList({
        //     model: db.masterDetails,
        //     where,
        //     order: [['code', 'asc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res
        // });
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Details');
    }
};

/**
* 
* @param {*} req 
* @param {*} res 



*/
const saveMasterDetails = async (req, res) => {
    try {
        const masterDetails = req.body;
        console.log("masterDetails",masterDetails);
        let MasterName = masterDetails.MasterName ? masterDetails.MasterName +' code already in use !'  : 'Master details code already in use !' ;
        const PKID = masterDetails && masterDetails.id ? masterDetails.id : undefined;
 
        const ChekAlreadyExist = await _FindMasterDetailsAlreadyExistOrNot(PKID, masterDetails.code, masterDetails.masterCategoryID, true);
        if (ChekAlreadyExist && ChekAlreadyExist !== "success") throw util.generateWarning(MasterName, codes.CODE_ALREADY_EXISTS);

        if (!masterDetails.order || masterDetails.order == null || masterDetails.order === 0) {
            lastOrder = await getLastOrder(masterDetails.masterCategoryID);

            if (lastOrder && lastOrder.order)
                masterDetails.order = lastOrder.order + 1;
            else
                masterDetails.order = 1;
        }

        if (util.missingRequiredFields('', masterDetails, res) === '') {
            await dal.saveData(db.masterDetails, masterDetails, res, req.user.id);
        }
        else {
            console.log("Backend master Details Data else condition", req)
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'saving master Details');
    }
};

const deleteMasterDetails = async (req, res) => {

    try {
        if (!req.query.id) {
            throw util.generateWarning(`Please provide master Details id`, codes.ID_NOT_FOUND);
        }
        dal.deleteRecords(db.masterDetails, req.query.id, req.user.id, res);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting master category');
    }





};


module.exports.saveMasterDetails = saveMasterDetails;
module.exports.deleteMasterDetails = deleteMasterDetails;
module.exports.getMasterDetails = getMasterDetails;