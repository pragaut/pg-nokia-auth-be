var express = require('express');
var router = express.Router();
const util = require('../util');
const user = require('../controllers/user');

router.post('/login', (req, res) => util.oprMiddleware(req,res) ? user.authenticate(req, res) : () => {});
router.post('/refreshToken', (req, res) => util.oprMiddleware(req,res) ? user.refreshToken(req, res) : () => {});
router.post('/forgotPassword', (req, res) => util.oprMiddleware(req,res) ? user.forgotPassword(req, res) : () => {});
router.post('/resetPassword', (req, res) => util.oprMiddleware(req,res) ? user.resetPassword(req, res) : () => {});
router.post('/isTokenValid', (req, res) => util.oprMiddleware(req,res) ? user.tokenIsValid(req, res) : () => {});
router.post('/register', (req, res) => util.oprMiddleware(req,res) ? user.register(req, res) : () => {});
router.post('/register-login', (req, res) => util.oprMiddleware(req,res) ? user.registerLogin(req, res) : () => {});
router.post('/update-profile', (req, res) => util.oprMiddleware(req,res) ? user.updateProfile(req, res) : () => {});
router.post('/resend-otp', (req, res) => util.oprMiddleware(req,res) ? user.resendOTP(req, res) : () => {});
router.post('/register-free-trial', (req, res) => util.oprMiddleware(req,res) ? user.registerFreeTrial(req, res) : () => {});

module.exports = router;
