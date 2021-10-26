var express = require('express');
var router = express.Router();
const util = require('../util');
const admin = require('../controllers/admin');

//console.log("Route",admin)

router.get('/orgRelationTypeMaster', (req, res) => admin.getOrgRelationTypeMaster(req, res));
router.put('/orgRelationTypeMaster', (req, res) => admin.saveorgRelationTypeMaster(req, res));
router.post('/orgRelationTypeMaster', (req, res) => admin.saveorgRelationTypeMaster(req, res));
router.delete('/orgRelationTypeMaster', (req, res) => admin.deleteOrgRelationTypeMaster(req, res));

router.get('/groupMaster', (req, res) => admin.getGroupMaster(req, res));
router.put('/groupMaster', (req, res) => admin.saveGroupMaster(req, res));
router.post('/groupMaster', (req, res) => admin.saveGroupMaster(req, res));
router.delete('/groupMaster', (req, res) => admin.deleteGroupMaster(req, res));

router.get('/alarmTypeMaster', (req, res) => admin.getAlarmTypeMaster(req, res));
router.put('/alarmTypeMaster', (req, res) => admin.saveAlarmTypeMaster(req, res));
router.post('/alarmTypeMaster', (req, res) => admin.saveAlarmTypeMaster(req, res));
router.delete('/alarmTypeMaster', (req, res) => admin.deleteAlarmTypeMaster(req, res));

router.get('/notificationMaster', (req, res) => admin.getNotificationMaster(req, res));
router.put('/notificationMaster', (req, res) => admin.saveNotificationMaster(req, res));
router.post('/notificationMaster', (req, res) => admin.saveNotificationMaster(req, res));
router.delete('/notificationMaster', (req, res) => admin.deleteNotificationMaster(req, res));

router.get('/moduleMaster', (req, res) => admin.getModuleMaster(req, res));
router.put('/moduleMaster', (req, res) => admin.saveModuleMaster(req, res));
router.post('/moduleMaster', (req, res) => admin.saveModuleMaster(req, res));
router.delete('/moduleMaster', (req, res) => admin.deleteModuleMaster(req, res));

//#region Year Master
router.get('/yearMaster', (req, res) => admin.getYearMaster(req, res));
router.get('/yearMaster', (req, res) => admin.getYearMasterById(req, res));
//#endregion

router.get('/roleMaster', (req, res) => admin.getRoleMaster(req, res));
router.put('/roleMaster', (req, res) => admin.saveRoleMaster(req, res));
router.post('/roleMaster', (req, res) => admin.saveRoleMaster(req, res));
router.delete('/roleMaster', (req, res) => admin.deleteRoleMaster(req, res));
router.get('/roleMaster/getByModuleId', (req, res) => admin.getRoleMasterByModuleId(req, res));

router.get('/companyMaster', (req, res) => admin.getCompanyMaster(req, res));
router.put('/companyMaster', (req, res) => admin.saveCompanyMaster(req, res));
router.post('/companyMaster', (req, res) => admin.saveCompanyMaster(req, res));
router.delete('/companyMaster', (req, res) => admin.deleteCompanyMaster(req, res));
router.get('/companyMaster/getByGroupMasterId', (req, res) => admin.getCompanyMasterByGroupMasterId(req, res));

router.get('/plantMaster', (req, res) => admin.getplantMaster(req, res));
router.put('/plantMaster', (req, res) => admin.saveplantMaster(req, res));
router.post('/plantMaster', (req, res) => admin.saveplantMaster(req, res));
router.delete('/plantMaster', (req, res) => admin.deleteplantMaster(req, res));
router.get('/plantMaster/getByGroupCompanyMasterId', (req, res) => admin.getplantMasterByGroupCompanyMasterId(req, res));
router.get('/plantMaster/getPlantByCompanyId', (req, res) => admin.getplantMasterByCompanyMasterId(req, res));
router.get('/plantMaster/getPlantByCompanyID_UsingProcedure', (req, res) => admin.getPlantByCompanyID_UsingProcedure(req, res));

//#region Status Master
router.get('/statusMaster', (req, res) => admin.getStatusMaster(req, res));
router.get('/statusMaster/getById', (req, res) => admin.getStatusMasterById(req, res));
//#endregion

//#region Year Type Master
router.get('/yearTypeMaster', (req, res) => admin.getYearTypeMaster(req, res));
router.get('/yearTypeMaster', (req, res) => admin.getYearTypeMasterById(req, res));
//#endregion

//#region Country Master
router.get('/countryMaster', (req, res) => admin.getCountryMaster(req, res));
//#endregion

//#region Stare Master
router.get('/stateMaster', (req, res) => admin.getStateMaster(req, res));
//#endregion

//#region City Master
router.get('/cityMaster', (req, res) => admin.getCityMaster(req, res));
//#endregion

//#region Gender Master
router.get('/genderMaster', (req, res) => admin.getGenderMaster(req, res));
//#endregion

//#region Organisation Details
router.get('/organisationDetails', (req, res) => admin.getOrganisationDetails(req, res));
router.put('/organisationDetails', (req, res) => admin.saveOrganisationDetails(req, res));
router.post('/organisationDetails', (req, res) => admin.saveOrganisationDetails(req, res));
router.delete('/organisationDetails', (req, res) => admin.deleteOrganisationDetails(req, res));
//#endregion

//#region Organisation Employee Details
router.get('/organisationEmployeeDetails', (req, res) => admin.getOrganisationEmployeeDetails(req, res));
router.put('/organisationEmployeeDetails', (req, res) => admin.saveOrganisationEmployeeDetails(req, res));
router.post('/organisationEmployeeDetails', (req, res) => admin.saveOrganisationEmployeeDetails(req, res));
router.delete('/organisationEmployeeDetails', (req, res) => admin.deleteOrganisationEmployeeDetails(req, res));
//#endregion

//#region Organisation Module Details

router.get('/organisationGroupModuleDetails', (req, res) => admin.getOrganisationGroupModuleDetails(req, res));
router.post('/organisationGroupModuleDetails', (req, res) => admin.saveOrganisationGroupModuleDetails(req, res));

//#endregion


module.exports = router;