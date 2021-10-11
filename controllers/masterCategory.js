const { db } = require('../models');
const dal = require('../dal');
const util = require('../util/');
const responseHelper = require('../util/response.helper');
const codes = require('../util/codes').codes;


const getMasterCategoryById = async (req, res) => {

    try {
        const result = await dal.findById(db.masterCategory, req.query.id);

        responseHelper.success(res, codes.SUCCESS, result);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting master Category');
    }
};

const _findCategoryWithCode = async (Code, isActive) => {
    const where = {};

    typeof isActive === 'undefined' ? '' : where.active = isActive;
    where.masterCategoryCode = Code;
    //where.emailConfirmed = 1;

    const masterCategory = await dal.findOne(db.masterCategory, where, true);

    //console.log('find one: ', user);
    return masterCategory;
};


/**
* 
* @param {*} req 
* @param {*} res 
* 
* by defaut gives last one month data.
*/
const getMasterCategory = async (req, res) => {
    try {
        let where = [];
        where.push(util.constructWheresForSequelize('active', 1));
        if (req.query.id) {
            return getMasterCategoryById(req, res);
        }
        else {
            db.sequelize.query('call Asp_MasterCategory_Get_MasterCategoryDetails(:MasterCategoryId, :ParentMasterCategoryID, :MasterCategoryCode, :ParentMasterCategoryCode)', { replacements: { MasterCategoryId: '', ParentMasterCategoryID: '', MasterCategoryCode: '', ParentMasterCategoryCode: '' } }).then(results => {
                responseHelper.success(res, 200, results, 'Master Category List successfully', '-1', results.length);
            }).catch(err => {
                responseHelper.error(res, err.code ? err.code : codes.ERROR, err, 'Error in Master Category List  details');

            });
        }
        // await dal.getList({
        //     model: db.masterCategory,
        //     where,
        //     order: [['masterCategoryName', 'asc']], include: true, rowsToReturn: req.query.rows, pageIndex: req.query.pageIndex, res
        // });
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting Chapter');
    }
};

/**
* 
* @param {*} req 
* @param {*} res   
*/


const _FindMasterCategoryAlreadyExistOrNot = async (id, Code) => {
    let where = [];
    if (id && id !== null && id !== 'undefined') {
        where.push(util.constructWheresForNotEqualSequelize('id', id));
    }
    where.push(util.constructWheresForSequelize('active', 1));
    where.push(util.constructWheresForSequelize('masterCategoryCode', Code));

    const masterCategoryDetails = await dal.getList({ model: db.masterCategory, where, order: [['createdAt', 'desc']], include: false, });
    if (masterCategoryDetails && masterCategoryDetails.length > 0) {
        return 'already exist'
    }
    else {
        return 'success'
    }
}
const saveMasterCategory = async (req, res) => {
    try {
        const masterCategory = req.body;

        const PKID = masterCategory && masterCategory.id ? masterCategory.id : undefined;
        const ChekAlreadyExist = await _FindMasterCategoryAlreadyExistOrNot(PKID, masterCategory.masterCategoryCode);
        let CodeMsg = masterCategory && masterCategory.masterCategoryCode ? 'Master Category "' + masterCategory.masterCategoryCode + '" already exist' : 'Master category code already exist';
        if (ChekAlreadyExist && ChekAlreadyExist !== "success") throw util.generateWarning(CodeMsg, codes.CODE_ALREADY_EXISTS);


        // if (typeof masterCategory.id === 'undefined'){
        //     const _CategoryWithCode = await _findCategoryWithCode(masterCategory.masterCategoryCode, true);
        //     if (masterCategory && _CategoryWithCode && masterCategory.masterCategoryCode ===  _CategoryWithCode.masterCategoryCode) throw util.generateWarning('Master Category Code already in use', codes.CODE_ALREADY_EXISTS);

        // } 
        if (util.missingRequiredFields('', masterCategory, res) === '') {
            await dal.saveData(db.masterCategory, masterCategory, res, req.user.id);
        }
        else {
            console.log("Backend masterCategory Data else condition", req)
        }
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'saving master category');
    }
};

const deleteMasterCategory = async (req, res) => {

    try {
        if (!req.query.id) {
            throw util.generateWarning(`Please provide master category id`, codes.ID_NOT_FOUND);
        }
        dal.deleteRecords(db.masterCategory, req.query.id, req.user.id, res);
    }
    catch (error) {
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting master category');
    }
};


module.exports.saveMasterCategory = saveMasterCategory;
module.exports.deleteMasterCategory = deleteMasterCategory;
module.exports.getMasterCategory = getMasterCategory;