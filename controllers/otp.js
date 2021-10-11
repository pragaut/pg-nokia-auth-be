const db = require('../models').db;
const dal = require('../dal');
const util = require('../util/');
const config = require('../config').config;
const encryptionHelper = require('../util/encryption.helper');
const responseHelper = require('../util/response.helper');
const codes = require('../util/codes').codes;
const constants = require('../util/constants');
const email = require('../util/email');
const smsService = require('../util/sms');
const userctr = require('./user');


const _deleteOTP = async (sentTo, otp, type, requestType) => {
	const where = {
	};

	if (typeof sentTo !== 'undefined') {
		where.sentTo = sentTo;
	}

	if (typeof otp !== 'undefined') {
		where.code = otp;
	}

	if (typeof type !== 'undefined') {
		where.type = type;
	}

	if (typeof requestType !== 'undefined') {
		where.requestType = requestType;
	}

	await dal.destroy(db.otp, where);
};


/**
 *
 * @param {*} res
 * @param {*} userId
 * @param {*} sendTo
 * @param {*} type
 * @param {*} requestType means Registration (default) , Reset Password
 * @param {*} code
 * @param {*} name

 */
const _generateAndSendOTP = async (res, userId, sendTo, type, requestType, code, name) => {
	try {
		const dataToBeSaved = {
			sentTo: sendTo,
			type,
			requestType,
			userId,
			code: code || util.generateRandomCode(config.OTP_LENGTH),
			otpExpiresAt: util.dateAdd(new Date(), 'minute', config.OTP_ALLOWED_FOR_HOW_LONG),
		};

		// for staging and dev purpose, let's just save the fixed code so we can use it for verification
		if (process.env.MODE !== 'production') {
			dataToBeSaved.code = config.STAGING.CODE;
		}

		// for security purpose, let's remove their previous codes
		await _deleteOTP(sendTo, undefined, type, requestType);

		// save the otp
		await dal.saveData(db.otp, dataToBeSaved);


		// if request type is null, set it to registration

		if (typeof requestType === 'undefined') {
			requestType = 'registration';
		}

		// otp saved to DB, now send it to user

		// send OTP now
		if (type === 'email') {
			const emailResult = await email.sendEmailWithTemplate(res, `${requestType}.` + 'otp.email', { name, otp: dataToBeSaved.code }, sendTo, 'OTP delivered successfully');

			// It must have sent the email. Just return the results, just incase for testing
			return emailResult;
		}

		const otpResult = await smsService.sendSMSWithTemplate(res, `${requestType}.` + 'otp.mobile', { name, otp: dataToBeSaved.code }, sendTo, 'OTP delivered successfully');

		// otp result will send the email. Just return the results, just incase for testing the results
		return otpResult;
	} catch (error) {
		if (!error.code) error.code = codes.COULD_NOT_SEND_OTP;

		if (res) {
			responseHelper.error(res, error, error.code, `Generating OTP for ${type}`);
		} else {
			throw error;
		}
	}
};

const _generateOTP = async (res, userId, sendTo, type, requestType, code, name) => {
	try {
		const dataToBeSaved = {
			sentTo: sendTo,
			type,
			requestType,
			userId,
			code: code || util.generateRandomCode(config.OTP_LENGTH),
			otpExpiresAt: util.dateAdd(new Date(), 'minute', config.OTP_ALLOWED_FOR_HOW_LONG),
		};

		// for staging and dev purpose, let's just save the fixed code so we can use it for verification
		if (process.env.MODE !== 'production') {
			dataToBeSaved.code = config.STAGING.CODE;
		}

		// for security purpose, let's remove their previous codes
		await _deleteOTP(sendTo, undefined, type, requestType);

		// save the otp
		const otpResult = await dal.saveData(db.otp, dataToBeSaved);
		
		return otpResult;

	} catch (error) {
		if (!error.code) error.code = codes.COULD_NOT_SEND_OTP;

		if (res) {
			responseHelper.error(res, error, error.code, `Generating OTP for ${type}`);
		} else {
			throw error;
		}
	}
};

const _SendOTP = async (res, userId, sendTo, type, requestType, code, name) => {
	try {
		
		if (typeof requestType === 'undefined') {
			requestType = 'freetrial-password.mobile';
		}

		// otp saved to DB, now send it to user

		// send OTP now
		if (type === 'email') {
			const emailResult = await email.sendEmailWithTemplate(res, `${requestType}.`+'email', { name, pwd: code }, sendTo, 'Password delivered successfully');
			// It must have sent the email. Just return the results, just incase for testing
			return emailResult;
		}
		else{
			const otpResult = await smsService.sendSMSWithTemplate(res, `${requestType}.` + 'mobile', { name, otp: code }, sendTo, 'Password delivered successfully');
			// otp result will send the email. Just return the results, just incase for testing the results
			return otpResult;
		}
		

	} catch (error) {
		if (!error.code) error.code = codes.COULD_NOT_SEND_OTP;

		if (res) {
			responseHelper.error(res, error, error.code, `Generating Password for ${type}`);
		} else {
			throw error;
		}
	}
};


const _updateRewardPoints = async (referralCode) => {
	const _referredBy = await dal.findOne(db.user, {
		referralCode
	});


	if (!_referredBy)
		return;

	const referredByUser = _referredBy.dataValues;

	if (referredByUser && referredByUser.id) {
		// bingo, we found the user
		const userToSave = {
			id: referredByUser.id,
			rewardPoints: referredByUser.rewardPoints + 100
		};

		await dal.saveData(db.user, userToSave);

		return true;

	}

	return false;

};


const _verifyOTP = async (res, userId, otp, type, requestType, referredByCode, emailForConfirmation) => {
	const where = [];

	try {
		where.push(util.constructWheresForSequelize('code', otp));

		if (typeof type !== 'undefined') {
			where.push(util.constructWheresForSequelize('type', type));
		}

		if (typeof requestType !== 'undefined') {
			where.push(util.constructWheresForSequelize('requestType', requestType));
		}

		const otps = await dal.getList({ model: db.otp, where, order: [], include: false, rowsToReturn: 10, pageIndex: 0, includedAttributes: {} });
		console.log('otps: ', where);

		if (typeof otps === 'undefined' || otps.length === 0) {
			// no otp found
			const error = process.env.MODE === 'production' ? util.generateWarning('WRONG OTP') //util.generateWarning('Incorrect OTP. Please enter a valid OTP and try again')
				: util.generateWarning('WRONG OTP') //util.generateWarning(`Incorrect OTP. Please note that in staging mode, you will need to use ${config.STAGING.CODE} for verifying otp of any type. However, please note that you will need to remember that the otp first need to be generated through registration or through resend confirmation API so it can store the hardcoded value in the database`);
			error.code = codes.OTP_INCORRECT;
			throw error;
		} else {
			// let's check if otp is not expired
			const _otp = otps[0];

			if (new Date() > new Date(_otp.OTPExpiresAt)) {
				// otp expired
				const error = util.generateWarning('OTP EXPIRED');
				error.code = codes.OTP_EXPIRED;

				// delete the OTP
				_deleteOTP(undefined, otp, type, requestType);

				throw error;
			}

			// if we have come here, it means that the OTP has been validated
			// send success response

			// let's just remove the OTP
			_deleteOTP(undefined, otp, type, requestType);

			// now, since we have authenticated OTP, please update the user with the values

			const userData = {
				id: userId,
				rewardPoints: 0
			};

			if (type === 'email') {
				/**
				 * for referrals, we will be doing following:
				 * 
				 * when a user is registered with a referral code, we will be crediting the user with 100
				 * 
				 */

				// we will need to credit the user 100 bucks if he has a referral code


				if (referredByCode) {
					if (_updateRewardPoints(referredByCode)) {
						userData.rewardPoints = 100;
					}
					else {
						userData.rewardPoints = 0;
					}
				}

				const specialRewards = util.getSpecialReward(emailForConfirmation);

				if (specialRewards > 0) {
					userData.rewardPoints = specialRewards;
				}

				userData.emailConfirmed = 1;
				await dal.saveData(db.user, userData);
			}
			else if (type === 'mobile') {
				userData.mobileConfirmed = 1;
				await dal.saveData(db.user, userData);
			}

			if (res) responseHelper.success(res, 200, {
				success: true,
				verified: true,
				type: requestType
			}, 'OTP is validated successfully');

			return true;
		}
	} catch (error) {
		error.code = error.code ? error.code : codes.ERROR;

		if (res) responseHelper.error(res, error, error.code, 'OTP Verifiation');
		else {
			throw error;
		}
	}
};


const findUserById = async userId => await dal.findById(db.user, userId);


const get_user_if_exists = async (req, res, request_source) => {
	try {
		//console.log("get_user_if_exists req ",req);

		const user = await findUserById(req.body.userId);

		if (!user) {
			const error = util.generateWarning('Cannot find the user id. Please check the user id and try again', codes.ID_NOT_FOUND);
			responseHelper.error(res, error, codes.ID_NOT_FOUND, 'Verifying Email OTP');
			return undefined;
		}

		return user;

	} catch (error) {
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, request_source);
	}

};


const verify_otp_for_updating_password = async (req, res) => {
	try {
		// retrieve user by userId
		const user = await get_user_if_exists(req, res, 'updating password')

		if (user) {
			await _verifyOTP(undefined, user.id, req.body.otp, undefined, constants.OTP.REQUEST_TYPES.FORGOT_PASSWORD);

			// now let's create a code and send it back
			const token = encryptionHelper.encryptText(JSON.stringify({
				userId: user.id,
				key: config.INJECTED_KEY,
				expiresAt: util.dateAdd(new Date(), 'minute', 5),
			}));

			responseHelper.success(res, 200, {
				userId: user.id,
				passwordToken: token,
				type: constants.OTP.REQUEST_TYPES.FORGOT_PASSWORD
			}, 'OTP verified successfully');
		}
	} catch (error) {
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'Verying OTP');
	}
};


const verify_email_with_otp = async (req, res) => {
	const user = await get_user_if_exists(req, res, 'verifying email');

	if (user) {
		return await _verifyOTP(res, user.id, req.body.otp, 'email', constants.OTP.REQUEST_TYPES.REGISTRATION, user.referredByCode, user.email);
	}
};

const verify_mobile_with_pwd = async (req, res) => {
	const user = await get_user_if_exists(req, res, 'verifying email');
	if (user) {
		//const mobile_pwd = await _verifyOTP(undefined, user.id, req.body.otp, 'mobile', constants.OTP.REQUEST_TYPES.FREETRIAL_PASSWORD, user.referredByCode, user.email);
		return await _verifyOTP(res, user.id, req.body.otp, 'email', constants.OTP.REQUEST_TYPES.FREETRIAL_PASSWORD , user.referredByCode, user.email);
	}
};

const verify_email_with_otp_and_login = async (req, res) => {
	const user = await get_user_if_exists(req, res, 'verifying email');

	if (user) {
		const verifyOTP = _verifyOTP(res, user.id, req.body.otp, 'email', constants.OTP.REQUEST_TYPES.REGISTRATION, user.referredByCode, user.email);
		//console.log("verifyOTP",verifyOTP);
		//req.body.email=user.email;
		await userctr.authenticate(req, res);
		//return await verifyOTP;
	}
};


const save_mobile_and_send_otp_for_device_verification = async (req, res) => {
	try {

		const user = await get_user_if_exists(req, res, 'save+send Device Verification');

		if (user) {
			await dal.saveData(db.user, {
				id: req.body.userId,
				mobile: req.body.mobile
			});

			await _generateAndSendOTP(res, req.body.userId, req.body.mobile, 'mobile', constants.OTP.REQUEST_TYPES.DEVICE_VERIFICATION);
		}
	} catch (error) {
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'Saving and sending otp');
	}
};


const send_otp_for_device_verification = async (req, res) => {
	const user = await get_user_if_exists(req, res, 'device-confirmation');

	// if not user, then the message has already been sent, so no worries
	if (user) {
		_generateAndSendOTP(res, user.id, user.mobile, 'mobile', constants.OTP.REQUEST_TYPES.DEVICE_VERIFICATION);
	}
};


const verify_otp_for_device_verification = async (req, res) => {
	try {
			
	const user = await get_user_if_exists(req, res, 'otp for device verificaiton');

	if (user) {
		const result = await _verifyOTP(undefined, user.id, req.body.otp, 'mobile', constants.OTP.REQUEST_TYPES.DEVICE_VERIFICATION, user.referredByCode);

		if (result === true) {
			try {
				await dal.saveData(db.user, {
					id: req.body.userId,
					coaching_session_id: req.body.deviceId
				});

				responseHelper.success(res, 200, { verified: true, type: constants.OTP.REQUEST_TYPES.DEVICE_VERIFICATION }, 'OTP verified successfully');

			} catch (error) {
				responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'saving session id to user');
			}
		}
		else {
			responseHelper.success(res, 200, { verified: false, type: constants.OTP.REQUEST_TYPES.DEVICE_VERIFICATION }, 'OTP is invalid');
		}
	}

	} catch (error){
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'Verying OTP');
	}

};


const send_otp_for_phone_update_confirmation = async (req, res) => {
	const user = await get_user_if_exists(req, res, 'otp for phone update confirmation');

	// if not user, then the message has already been sent, so no worries
	if (user) {
		// send to mobile first
		try {
			const result = await _generateAndSendOTP(undefined, user.id, user.mobile, 'mobile', constants.OTP.REQUEST_TYPES.CHANGE_MOBILE_CONFIRMATION);

			if (result) {
				await _generateAndSendOTP(res, user.id, user.email, 'email', constants.OTP.REQUEST_TYPES.CHANGE_MOBILE_CONFIRMATION)
			}
			else {
				throw util.generateWarning('error in generating', codes.COULD_NOT_SEND_OTP);
			}
		} catch (error) {
			responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'otp-phone-update-confirmation');
		}
	}
};


const verify_otp_for_phone_update_confirmation = async (req, res) => {
	const user = await get_user_if_exists(req, res, 'otp for phone update confirmation');

	if (user)
		return await _verifyOTP(res, user.id, req.body.otp, undefined, constants.OTP.REQUEST_TYPES.CHANGE_MOBILE_CONFIRMATION);
};


const send_otp_for_phone_update = async (req, res) => {
	const user = await get_user_if_exists(req, res, 'otp-phone-update');

	// if not user, then the message has already been sent, so no worries
	if (user) {
		_generateAndSendOTP(res, user.id, req.body.mobile, 'mobile', constants.OTP.REQUEST_TYPES.CHANGE_MOBILE);
	}
};


const verify_otp_for_phone_update = async (req, res) => {
	const user = await get_user_if_exists(req, res, 'otp-phone-update');

	if (user)
		return await _verifyOTP(res, user.id, req.body.otp, 'mobile', constants.OTP.REQUEST_TYPES.CHANGE_MOBILE);
};


const send_otp_for_cod = async (req, res) => {
	const user = await get_user_if_exists(req, res, 'shop-cod');

	// if not user, then the message has already been sent, so no worries
	if (user) {
		_generateAndSendOTP(res, user.id, user.mobile, 'mobile', constants.OTP.REQUEST_TYPES.SHOPPING_COD);
	}
};


const verify_otp_for_cod = async (req, res) => {
	const user = await get_user_if_exists(req, res, 'shop-cod');

	if (user)
		return await _verifyOTP(res, user.id, req.body.otp, undefined, constants.OTP.REQUEST_TYPES.SHOPPING_COD);
};


module.exports._verifyOTP = _verifyOTP;
module.exports._generateOTP = _generateOTP;
module.exports._generateAndSendOTP = _generateAndSendOTP;
module.exports._updateRewardPoints = _updateRewardPoints;
module.exports._SendOTP = _SendOTP;

module.exports.verify_email_with_otp = verify_email_with_otp;
module.exports.verify_mobile_with_pwd = verify_mobile_with_pwd;
module.exports.verify_email_with_otp_and_login = verify_email_with_otp_and_login;
module.exports.verify_otp_for_updating_password = verify_otp_for_updating_password;
module.exports.save_mobile_and_send_otp_for_device_verification = save_mobile_and_send_otp_for_device_verification;
module.exports.send_otp_for_device_verification = send_otp_for_device_verification;
module.exports.verify_otp_for_device_verification = verify_otp_for_device_verification;

module.exports.send_otp_for_phone_update = send_otp_for_phone_update;
module.exports.verify_otp_for_phone_update = verify_otp_for_phone_update;
module.exports.send_otp_for_phone_update_confirmation = send_otp_for_phone_update_confirmation;
module.exports.verify_otp_for_phone_update_confirmation = verify_otp_for_phone_update_confirmation;
module.exports.send_otp_for_cod = send_otp_for_cod;
module.exports.verify_otp_for_cod = verify_otp_for_cod;