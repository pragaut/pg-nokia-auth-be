var express = require('express');
var router = express.Router();
const util = require('../util');
const admin = require('../controllers/admin');

//console.log("Route",admin)

router.get('/groupMaster', (req, res) => admin.getGroupMaster(req, res));
router.put('/groupMaster', (req, res) => admin.saveGroupMaster(req, res));
router.post('/groupMaster', (req, res) => admin.saveGroupMaster(req, res));
router.delete('/groupMaster', (req, res) => admin.deleteGroupMaster(req, res));

router.get('/alarmTypeMaster', (req, res) => admin.getAlarmTypeMaster(req, res));
router.put('/alarmTypeMaster', (req, res) => admin.saveAlarmTypeMaster(req, res));
router.post('/alarmTypeMaster', (req, res) => admin.saveAlarmTypeMaster(req, res));
router.delete('/alarmTypeMaster', (req, res) => admin.deleteAlarmTypeMaster(req, res));

router.get('/moduleMaster', (req, res) => admin.getModuleMaster(req, res));
router.put('/moduleMaster', (req, res) => admin.saveModuleMaster(req, res));
router.post('/moduleMaster', (req, res) => admin.saveModuleMaster(req, res));
router.delete('/moduleMaster', (req, res) => admin.deleteModuleMaster(req, res));
router.get('/moduleMaster/getByGroupId', (req, res) => admin.getModuleMasterByGroupId(req, res));

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

router.get('/yearMaster', (req, res) => admin.getYearMaster(req, res));
router.get('/yearMaster/ByYearTypeId', (req, res) => admin.getYearMaster(req, res));
router.put('/yearMaster', (req, res) => admin.saveYearMaster(req, res));
router.post('/yearMaster', (req, res) => admin.saveYearMaster(req, res));
router.delete('/yearMaster', (req, res) => admin.deleteYearMaster(req, res));

//#region Status Master
router.get('/statusMaster', (req, res) => admin.getStatusMaster(req, res));
router.get('/statusMaster/getById', (req, res) => admin.getStatusMasterById(req, res));
//#endregion

//#region Year Type Master
router.get('/yearTypeMaster', (req, res) => admin.getYearTypeMaster(req, res));
router.get('/yearTypeMaster', (req, res) => admin.getYearTypeMasterById(req, res));
//#endregion

module.exports = router;