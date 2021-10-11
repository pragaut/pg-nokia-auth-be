const express = require('express');
const router = express.Router();
const user = require('../controllers/user');
/* GET users listing. */

router.get('/', function (req, res, next) { user.getUsers(req, res); });
router.get('/getUsersP', function (req, res, next) { user.getUsersP(req, res); });
router.get('/getCurrentUserSessionDetails', function (req, res, next) { user.getCurrentUserSessionDetails(req, res); });


router.post('/', function (req, res, next) {
  // save the existing user
  user.saveUser(req, res);
});

router.put('/', function (req, res, next) {
  // save the existing user
  user.saveUser(req, res);
});

router.put('/unLockAccount', function (req, res, next) {
  // save the existing user
  user.unLockAccount(req, res);
});

router.post('/changepassword', function (req, res, next) {
  // save the existing user
  user.changePassword(req, res);
});


router.delete('/:id', function (req, res, next) {
  //console.log("user delete route");
  user.deleteRecord(req, res);
});

router.delete('/', function (req, res, next) {
  //console.log("user delete route 2");
  user.deleteRecord(req, res);
});

router.get('/:id', function (req, res, next) {
  user.getUserById(req, res);
});

//console.log("user routers");

module.exports = router;
