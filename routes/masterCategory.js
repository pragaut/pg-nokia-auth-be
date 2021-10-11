var express = require('express');
var router = express.Router();
const util = require('../util');
const masterCategory = require('../controllers/masterCategory');

//console.log("Route",masterCategory)
router.get('/', (req, res) => masterCategory.getMasterCategory(req, res));
router.put('/', (req, res) => masterCategory.saveMasterCategory(req, res));
router.post('/', (req, res) => masterCategory.saveMasterCategory(req, res));
router.delete('/', (req, res) => masterCategory.deleteMasterCategory(req, res));

module.exports = router;