var express = require('express');
var router = express.Router();
const util = require('../util');
const masterDetails = require('../controllers/masterDetails');
 
router.get('/', (req, res) => masterDetails.getMasterDetails(req, res));
router.put('/', (req, res) => masterDetails.saveMasterDetails(req, res));
router.post('/', (req, res) => masterDetails.saveMasterDetails(req, res));
router.delete('/', (req, res) => masterDetails.deleteMasterDetails(req, res));

module.exports = router;