var express = require('express');
var router = express.Router();
const util = require('../util');
const otp = require('../controllers/otp');

/** open routes */

router.post('/email-verification/verify-otp', (req, res) => otp.verify_email_with_otp(req, res));
router.post('/email-verification/verify-otp-and-login', (req, res) => otp.verify_email_with_otp_and_login(req, res));
router.post('/password-verification/verify-otp', (req, res) => otp.verify_otp_for_updating_password(req, res));
router.post('/password-verification/verify-mobil-pwd', (req, res) => otp.verify_mobile_with_pwd(req, res));

/** closed routes */

router.post('/device-verification/save-send-otp', (req, res) => otp.save_mobile_and_send_otp_for_device_verification(req, res));
router.post('/device-verification/send-otp', (req, res) => otp.send_otp_for_device_verification(req, res));
router.post('/device-verification/verify-otp', (req, res) => otp.verify_otp_for_device_verification(req, res));

router.post('/phone-update/send-otp', (req, res) => otp.send_otp_for_phone_update(req, res));
router.post('/phone-update/verify-otp', (req, res) => otp.verify_otp_for_phone_update(req, res));

router.post('/phone-update-confirm/send-otp', (req, res) => otp.send_otp_for_phone_update_confirmation(req, res));
router.post('/phone-update-confirm/verify-otp', (req, res) => otp.verify_otp_for_phone_update_confirmation(req, res));

router.post('/cod/send-otp', (req, res) => otp.send_otp_for_cod(req, res));
router.post('/cod/verify-otp', (req, res) => otp.verify_otp_for_cod(req, res));


module.exports = router;
