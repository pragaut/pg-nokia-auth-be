const dal = require('../dal');
const Op = require('sequelize').Op;
const util = require('../util/');
const fetch = require('../util/fetch');
const db = require('../models').db;
const responseHelper = require('../util/response.helper');
const encryptionHelper = require('../util/encryption.helper');
const codes = require('../util/codes').codes;
const config = require('../config').config;
const listAttributes = require('../config').listAttributes;
const constants = require('../util/constants');
const messages = require('../util/messages').messages[constants.LANGUAGE];
const otp = require('./otp');
const emailService = require('../util/email');
const smsService = require('../util/sms');

const _authenticate = async (email, password, requestSource, socialauth, ipAddress) => {
	// find if email exists
	//console.log("Auth api - socialAuth", socialauth);

	// const where = {
	// 	email,
	// 	active: 1
	// };

	const where = {
		[Op.or]: [{ username: email }],
		is_active: 1
	};
	//console.log("auth where : ", where);
	const include = [{
		model: db.userRole, as: 'userRoles',
		where: {
			isActive: 1
		},
		required: true,
		include: [{
			model: db.roleMaster, as: 'roleMaster',
			where: {
				isActive: 1,
			},
			required: false,
		}]
	}, {
		model: db.accessGroup, as: 'accessGroup',
		where: {
			active: 1,
		},
		required: false,
	}, {
		model: db.employeeMaster, as: 'employeeMaster',
		where: {
			isActive: 1,
		},
		required: false,
	}];
	//console.log("auth include : ", include);
	const user = await dal.findOne(db.user, where, true, include, 2, ['user', 'userRoles', 'roleMaster', 'accessGroup', 'employeeMaster']);
	//console.log("user : 1 ", user);

	if (!user) {
		const error = util.generateWarning(messages.INVALID_CREDENTIALS);
		error.code = codes.EMAIL_DOESNOT_EXIST;
		await saveAuthLogs(email, password, ipAddress, null, true, false, false);
		throw error;
	}
	else if (user.isUserLocked) {
		const error = util.generateWarning(messages.ACCOUNT_LOCKED);
		error.code = codes.ACCOUNT_LOCKED;
		await saveAuthLogs(email, password, ipAddress, user.id, false, false, true);
		throw error;
	}
	else {
		// validate password
		const passwordIsValid = encryptionHelper.validatePassword(password, user.password, user.saltPassword);
		//console.log("password Is Valid : ", passwordIsValid);
		if (!passwordIsValid) {
			// couldn't authenticate the password
			await saveUnSuccessfullCountAndLockDetails(user);
			await saveAuthLogs(email, password, ipAddress, user.id, false, true, false);
			//if(user.authType ==="social" || user.password === '' || typeof user.password === 'undefined')
			if (socialauth === "no" && (user.authType === "social" || user.password === '' || typeof user.password === 'undefined')) {
				// hash the password for security
				const password = util.generateRandomCode(6);

				const passwordSaltWrapper = encryptionHelper.hashPassword(password);

				const userData = {
					id: user.id,
					password: passwordSaltWrapper.password,
					passwordSalt: passwordSaltWrapper.salt,
					authType: "anand-group",
				};
				// let's not run a synced operation as user doesn't care
				dal.saveData(db.user, userData);

				requestType = 'password-reset';
				const emailResult = await emailService.sendEmailWithTemplate(undefined, `${requestType}`, { name: `${user.employeeMaster.employeeName}`, password: password }, user.email, 'Password delivered successfully');
				//console.log("emailResult", emailResult);

				const error = util.generateWarning(messages.PASSWORD_RESET);
				error.code = codes.PASSWORD_RESET;
				throw error;
			}
			else {
				const error = util.generateWarning(messages.INVALID_CREDENTIALS);
				error.code = codes.PASSWORD_INCORRECT;
				throw error;
			}
		}
		else {

			// if user's email is not confirmed. Please throw an error
			if (!user.employeeMaster.email)
				throw (util.generateWarning(messages.EMAIL_ID_NOT_CONFIRMED, codes.EMAIL_NOT_ACTIVATED));
			// password authenticated.			

			return user;
		}
	}
};
const saveUnSuccessfullCountAndLockDetails = async (user) => {
	try {
		const UserLockCount = 3;
		let isAdmin = false;
		if (user.userRoles) {
			user.userRoles.forEach(element => {
				//console.log("saveUnSuccessfullCountAndLockDetails role element 1 : ", element.dataValues.roleMaster)
				//console.log("saveUnSuccessfullCountAndLockDetails role element 2 : ", element.dataValues.roleMaster.dataValues)
				//console.log("saveUnSuccessfullCountAndLockDetails role element 3 : ", element.dataValues.roleMaster.dataValues.roleCode)
				if (element.dataValues.roleMaster.dataValues.roleCode && (element.dataValues.roleMaster.dataValues.roleCode === 'Admin' || element.dataValues.roleMaster.dataValues.roleCode === 'admin')) {
					isAdmin = true;
				}
			});
		}
		if (isAdmin && user.unSuccessfullLoginCount + 1 >= UserLockCount) {
			const password = util.generateRandomCode(6);
			const passwordSaltWrapper = encryptionHelper.hashPassword(password);

			const userData = {
				id: user.id,
				password: passwordSaltWrapper.password,
				passwordSalt: passwordSaltWrapper.salt,
				authType: "anand-group",
				unSuccessfullLoginCount: 0,
			};
			dal.saveData(db.user, userData);
			requestType = 'password-reset';
			const emailResult = await emailService.sendEmailWithTemplate(undefined, `${requestType}`, { name: `${user.firstName}` + " " + `${user.lastName}`, password: password }, user.email, 'Password delivered successfully');
			//console.log("emailResult", emailResult);

			const error = util.generateWarning(messages.PASSWORD_RESET);
			error.code = codes.PASSWORD_RESET;
			throw error;
		}
		else {
			const userData = {
				id: user.id,
				unSuccessfullLoginCount: user.unSuccessfullLoginCount ? user.unSuccessfullLoginCount + 1 : 1,
				isUserLocked: user.unSuccessfullLoginCount && user.unSuccessfullLoginCount + 1 >= UserLockCount ? 1 : 0
			};
			dal.saveData(db.user, userData);
		}
		return true;
	}
	catch (error) {
		return true;
	}
}

const saveAuthLogs = async (userName, password, ipAddress, userId, isInvalidUsername, isInvalidPassword, isAccountLocked) => {
	try {
		//console.log("isInvalidUsername :", isInvalidUsername);
		//console.log("isInvalidPassword :", isInvalidPassword);
		//console.log("isAccountLocked :", isAccountLocked);
		const dataToBeSaved = {
			userName: userName,
			password: password,
			dateTime: new Date(),
			count: 1,
			ipAddress: ipAddress ? ipAddress : '',
			isInvalidUsername: isInvalidUsername ? isInvalidUsername : 0,
			isInvalidPassword: isInvalidPassword ? isInvalidPassword : 0,
			isAccountLocked: isAccountLocked ? isAccountLocked : 0
		};
		//console.log("auth log dataToBeSaved : ", dataToBeSaved);
		const data = await dal.saveData(db.SuspiciousActivities, dataToBeSaved, null, userId);
		//console.log("auth log data : ", data);
		return true;
	}
	catch (error) {
		//console.log("error auth log : ", error);
		return true;
	}
}

const _authenticate_OTP = async (userOptions, requestSource, socialauth) => {
	// find if email exists
	const {
		userId, userName, userNameType, OTP
	} = userOptions;

	//console.log("Auth api - socialAuth",socialauth);	
	const where = {
		active: 1
	};
	if (userNameType === "email") {
		where.email = userName;
	}
	else {
		where.mobile = userName;
	}

	//console.log("where", where);
	const user = await dal.findOne(db.user, where, true);

	if (!user) {
		const error = util.generateWarning(messages.INVALID_CREDENTIALS);
		error.code = codes.EMAIL_DOESNOT_EXIST;

		throw error;
	}
	else {
		// validate otp 

		//console.log("validate otp user",user);

		const otpData = {
			userId: user.id,
			otp: OTP,
			userNameType: userNameType,
		};
		const requestOptions = {
			body: JSON.stringify(otpData)
		};

		//console.log("otpData",requestOptions);

		let otpIsValid = [];

		if (user) {
			if (userNameType === "email") {
				otpIsValid = await otp._verifyOTP(undefined, user.id, OTP, 'email', constants.OTP.REQUEST_TYPES.REGISTRATION, user.referredByCode, user.email);
			}
			else {
				otpIsValid = await otp._verifyOTP(undefined, user.id, OTP, 'mobile', constants.OTP.REQUEST_TYPES.REGISTRATION, user.referredByCode, user.mobile);
			}
		}


		//console.log("otpIsValid",otpIsValid);

		if (!otpIsValid) {
			// couldn't authenticate the password						
			const error = util.generateWarning("WRONG OTP");
			error.code = codes.OTP_INCORRECT;
			throw error;
		}
	}
};

/**
 *
 * @param {*} userOptions
 */

const _authenticate_social = async (userOptions, requestSource) => {
	//console.log('atleast here: ', userOptions);
	const {
		token, email, facebookUserId, authType, source, referredByCode
	} = userOptions;
	let user = {};

	// authtype will confirm the source of call

	if (authType === 'facebook') {
		user = await _verifyFacebookTokenAndGetUserData(email, facebookUserId, token);
	} else {
		user = await _verifyGoogleTokenAndGetUserData(email, token);
	}


	//console.log('t1');

	// if we have come here, it means we have got the user object

	// let's try to find the user by email

	let _user = await _findUserWithEmail(email);

	//console.log('t2');

	/** two cases here
	 * 1. If the user is new, and the request is for CRM, cannot proceed. 
	 * 2. If the user is old, and the request is for CRM, and user doesn't have CRM access, just kick him out
	 */


	if (_user) {
		// already exists. Let's not worry about it, and generate the token and send it back
	}
	else {
		// user doesn't exist. So let's create a user Automatically.

		const newUser = {
			email: user.email,
			mobile: null,
			profilePic: user.profilePic,
			active: 1, // active is true by default
			firstName: user.firstName,
			lastName: user.lastName,
			originPlatform: source,
			accessGroupId: process.env.DEFAULT_USER_GROUP,
			referralCode: util.generateRandomCode(6),
			referredByCode,
			customer: false,
			student: false,
			vendor: false,
			staker: false,
			player: false,
			emailConfirmed: true,
			authType: "social",
		};

		//console.log('userwa / sourcewa: ', source);

		// let's update the rewards points, if available
		newUser.rewardPoints = 0;

		if (referredByCode) {
			if (otp._updateRewardPoints(referredByCode)) {
				newUser.rewardPoints = 100;
			}
		}

		// const specialRewards = util.getSpecialReward(newUser.email);

		// if (specialRewards > 0) {
		// 	newUser.rewardPoints = specialRewards;
		// }

		_user = await dal.saveData(db.user, newUser);
	}

	//console.log('came here: ', _user);

	return _user;
};

const _deleteRecords = (ids, userId, res) => dal.deleteRecords(db.user, ids, userId, res);

const _deleteRecord = (id, userId, res) => _deleteRecords([id], userId, res);

const _findUserWithFacebookUserId = async (facebookUserId, isActive) => {
	const where = {};

	typeof isActive === 'undefined' ? '' : where.active = isActive;
	where.facebookId = facebookUserId;

	return await dal.findOne(db.user, where);
};

const _findUserWithMobile = async (phoneToSearch, isActive) => {
	const where = {};

	typeof isActive === 'undefined' ? '' : where.active = isActive;
	where.mobile = phoneToSearch;
	//where.mobileConfirmed = 1; // so we only search active users

	return await dal.findOne(db.user, where);
};

const _findVerifiedUserWithMobile = async (phoneToSearch, isActive) => {
	const where = {};

	typeof isActive === 'undefined' ? '' : where.active = isActive;
	where.mobile = phoneToSearch;
	where.mobileConfirmed = 1; // so we only search active users

	return await dal.findOne(db.user, where);
};

const _findUserWithEmail = async (emailToSearch, isActive) => {
	const where = {};

	typeof isActive === 'undefined' ? '' : where.active = isActive;
	where.email = emailToSearch;
	//where.emailConfirmed = 1;

	const user = await dal.findOne(db.user, where, true);

	//console.log('find one: ', user);
	return user;
};

const _findVerifiedUserWithEmail = async (emailToSearch, isActive) => {
	const where = {};

	typeof isActive === 'undefined' ? '' : where.active = isActive;
	where.email = emailToSearch;
	where.emailConfirmed = 1;

	const user = await dal.findOne(db.user, where, true);

	//console.log('find one: ', user);
	return user;
};

const _findUserWithId = async (id) => {
	// await dal.findById(db.user, id, false); 
	const where = {
		//[Op.or]: [{ username: email }],
		id: id,
		isActive: 1
	};
	//console.log("auth where : ", where);
	const include = [{
		model: db.userRole, as: 'userRoles',
		where: {
			isActive: 1
		},
		required: true,
		include: [{
			model: db.roleMaster, as: 'roleMaster',
			where: {
				isActive: 1,
			},
			required: false,
		}]
	}, {
		model: db.accessGroup, as: 'accessGroup',
		where: {
			active: 1,
		},
		required: false,
	}, {
		model: db.employeeMaster, as: 'employeeMaster',
		where: {
			isActive: 1,
		},
		required: false,
	}];
	//console.log("auth include : ", include);
	const Result = await dal.findOne(db.user, where, true, include, 2, ['user', 'userRoles', 'roleMaster', 'accessGroup', 'employeeMaster']);
	//console.log("auth include Result: ", Result);
	return Result;
};

const _getUsersByEmail = async (nameToSearch) => {
	const users = await db.user.findAndCountAll({
		attributes: ['id', 'email', 'firstName', 'lastName'],
		where: {
			[Op.or]: {
				email: {
					[Op.like]: `%${nameToSearch}%`,
				},
				firstName: {
					[Op.like]: `%${nameToSearch}%`,
				},
				lastName: {
					[Op.like]: `%${nameToSearch}%`,
				},
			},
		},
		order: ['email', 'firstName', 'lastName'],
	});


	if (users && users.length > 0) {
		return users;
	}

	return [];
};

const _refreshToken = async (email, token) => {
	try {
		const _token = await db.token.findOne({
			where: {
				refreshToken: token,
				email,
			},
		});
		// if token is not null, then it is a valid token.

		if (typeof _token === 'undefined' || !_token) {
			// couldn't find token
			const error = util.generateWarning(messages.TOKEN_REFRESH_CANNOT_VALIDATE);
			error.code = codes.TOKEN_REFRESH_INCORRECT;

			throw error;
		} else {
			// token is good
			// now we need to generate a new token for the user

			// let's add some random key to generate a different pattern

			const authToken = util.jwtService.createJWT({
				email,
				userId: _token.UserId,
				randomBytes: encryptionHelper.randomBytes(5), // let's keep it short
				injectedKey: config.INJECTED_KEY,
			}, config.TOKEN_ALLOWED_FOR_HOW_LONG);

			// send it back
			return authToken;
		}
	} catch (error) {
		error.code = error.code ? error.code : codes.ERROR;
		throw error;
	}
};

const _register = async (_user, userId, access, oprRequest, requestSource) => {
	const invalidFields = util.missingRequiredFields('register', _user);

	if (invalidFields === '') {
		// the fields are valid

		// we need to verify:
		// 1. Phone number should not be in use
		// 2. Email should not be in use

		const _userWithNumber = await _findUserWithMobile(_user.mobile, true);

		/** if phone number is in use, then don't proceed at all */
		if (_userWithNumber && _userWithNumber.mobile === _user.mobile) throw util.generateWarning('Phone number already in use', codes.PHONE_ALREADY_EXISTS);

		const _userWithEmail = await _findUserWithEmail(_user.email);

		/** if email is in use, then check if it is a google auth login or not
			 * and if it is google auth, we need to tell him, to login through google and then update the profile
			 * with more information.
			 *
			*/

		if (_userWithEmail && _userWithEmail.email === _user.email) {
			// user found.

			if (_userWithEmail.password === '' || typeof _userWithEmail.password === 'undefined') {
				// it is a social auth user
				throw util.generateWarning(messages.EMAIL_REGISTERED_SOCIAL, codes.EMAIL_ALREADY_EXISTS_SOCIAL_AUTH);
			}
			else if (_userWithEmail.emailConfirmed === false) {
				// let's try to save it again with new information
				_user.id = _userWithEmail.id;
			}
			else {
				// user's password is available. Don't proceed, the user already exists
				throw util.generateWarning(messages.EMAIL_ALREADY_EXISTS, codes.EMAIL_ALREADY_EXISTS);
			}
		}

		// ok, if it has come here, it is safe to register
		// let's save the user, and send the OTPs of user's email and phone

		// ok, let's move on with our work of registering


		_user.originPlatform = _user.source;
		_user.active = true;
		_user.mobileConfirmed = false;
		_user.emailConfirmed = false;

		// hash the password for security
		const passwordSaltWrapper = encryptionHelper.hashPassword(_user.password);

		_user.password = passwordSaltWrapper.password;
		_user.passwordSalt = passwordSaltWrapper.salt;

		_user.referralCode = util.generateRandomCode(6);
		_user.accessGroupId = process.env.DEFAULT_USER_GROUP;
		_user.authType = "Anand-Password-Login";

		let user = await dal.saveData(db.user, _user);

		if (_user.id) {
			user = _user;
		}

		return user;
	}

	// invalid fields found. Return and throw an error
	throw util.generateWarning(`Invalid input provided. Fields - ${invalidFields} were not provided.`, codes.INPUT_INVALID);
};

const _registerLogin = async (_user, userId, access, oprRequest, requestSource) => {
	const invalidFields = util.missingRequiredFields('registerLogin', _user);

	if (invalidFields === '') {
		// the fields are valid

		// we need to verify:
		// 1. Phone number should not be in use
		// 2. Email should not be in use

		let isRegistredUser = true;
		let _userData = []

		//console.log("LR 1");
		if (_user.userNameType === "mobile") {
			//console.log("LR 2");
			_user.mobile = _user.userName;
			_user.email = "";

			_userData = await _findUserWithMobile(_user.userName, true);
			/** if phone number is in use, then don't proceed at all */
			if (_userData && _userData.mobile === _user.userName) {
				//console.log("LR 3");
				_user.id = _userData.id;
				isRegistredUser = true;
				//throw util.generateWarning('Phone number already in use', codes.PHONE_ALREADY_EXISTS);
			}
			else {
				//console.log("LR 4");
				isRegistredUser = false;
			}
		}
		else if (_user.userNameType === "email") {
			//console.log("LR 5");
			_user.email = _user.userName;
			_user.mobile = "";

			_userData = await _findUserWithEmail(_user.userName);

			if (_userData && _userData.email === _user.userName) {
				//console.log("LR 6");
				//console.log("LR 9");
				_user.id = _userData.id;
				isRegistredUser = true;
			}
			else {
				//console.log("LR 10");
				isRegistredUser = false;
			}
		}

		// ok, if it has come here, it is safe to register
		// let's save the user, and send the OTPs of user's email and phone

		// ok, let's move on with our work of registering
		//console.log("LR 11");

		_user.originPlatform = _user.source;
		_user.active = true;
		_user.mobileConfirmed = false;
		_user.emailConfirmed = false;

		// hash the password for security
		//const passwordSaltWrapper = encryptionHelper.hashPassword(_user.password);
		//_user.password = passwordSaltWrapper.password;
		//_user.passwordSalt = passwordSaltWrapper.salt;

		_user.firstName = "";
		_user.lastName = "";
		_user.password = "";
		_user.passwordSalt = "";
		_user.referralCode = util.generateRandomCode(6);
		_user.accessGroupId = process.env.DEFAULT_USER_GROUP;
		_user.authType = "Anand-OTP-Login";
		_user.loginCount = 0;

		//console.log("12");
		let user = [];

		if (isRegistredUser === false) {
			//console.log("13");
			user = await dal.saveData(db.user, _user);
		}
		else {
			//console.log("14");
			_user = await _findUserWithId(_user.id);
		}
		if (_user.id) {
			//console.log("15");
			user = _user;
		}
		//console.log("16");
		return user;
	}
	//console.log("LR 17");
	// invalid fields found. Return and throw an error
	throw util.generateWarning(`Invalid input provided. Fields - ${invalidFields} were not provided.`, codes.INPUT_INVALID);
};

const _updateProfile = async (_user, userId, access, oprRequest, requestSource) => {
	const invalidFields = util.missingRequiredFields('updateProfile', _user);

	if (invalidFields === '') {
		// the fields are valid		

		// we need to verify:
		// 1. Phone number should not be in use
		// 2. Email should not be in use

		if (_user.userNameType === "mobile") {
			const _userWithNumber = await _findUserWithMobile(_user.MobileEmail, true);

			/** if phone number is in use, then don't proceed at all */
			if (_userWithNumber && _userWithNumber.mobile === _user.MobileEmail) {
				if (_userWithNumber.email !== undefined && _userWithNumber.email !== "" && _userWithNumber.email !== null) {
					throw util.generateWarning('Phone number already in use !!', codes.PHONE_ALREADY_EXISTS);
				}
				else {
					const newUserData = await dal.findById(db.user, _user.userId, true);
					let newUserId = _user.userId;
					let oldUserId = _userWithNumber.id;
					let _user2 = _userWithNumber;
					_user2.mobile = _user.MobileEmail;
					const userData1 = {
						id: _user2.id,
						firstName: _user.firstName,
						lastName: _user.lastName,
						email: newUserData.email,
						emailConfirmed: newUserData.emailConfirmed,
					};
					await dal.deleteRecords(db.user, newUserId, oldUserId, undefined);
					await dal.saveData(db.user, userData1);
					_user.userId = oldUserId;
				}
			}
			else {
				_user.mobile = _user.MobileEmail;

				const userData = {
					id: _user.userId,
					firstName: _user.firstName,
					lastName: _user.lastName,
					mobile: _user.MobileEmail,
				};

				await dal.saveData(db.user, userData);
			}

		}
		else if (_user.userNameType === "email") {
			const _userWithEmail = await _findUserWithEmail(_user.MobileEmail);
			if (_userWithEmail && _userWithEmail.email === _user.MobileEmail) {
				//console.log("_userWithEmail.mobile",_userWithEmail.mobile);		
				if (_userWithEmail.mobile !== undefined && _userWithEmail.mobile !== "" && _userWithEmail.mobile !== null) {
					throw util.generateWarning(messages.EMAIL_ALREADY_EXISTS, codes.EMAIL_ALREADY_EXISTS);
				}
				else {
					const newUserData = await dal.findById(db.user, _user.userId, true);
					let newUserId = _user.userId;
					let oldUserId = _userWithEmail.id;
					let _user2 = _userWithEmail;
					_user2.email = _user.MobileEmail;
					const userData2 = {
						id: _user2.id,
						firstName: _user.firstName,
						lastName: _user.lastName,
						mobile: newUserData.mobile,
						mobileConfirmed: newUserData.mobileConfirmed,
					};
					await dal.deleteRecords(db.user, newUserId, oldUserId, undefined);
					await dal.saveData(db.user, userData2);
					_user.userId = oldUserId;
				}
			}
			else {
				_user.email = _user.MobileEmail;
				const userData = {
					id: _user.userId,
					firstName: _user.firstName,
					lastName: _user.lastName,
					email: _user.MobileEmail,
				};
				await dal.saveData(db.user, userData);
			}
		}

		const user = await dal.findById(db.user, _user.userId, true);

		return user;
	}

	// invalid fields found. Return and throw an error
	throw util.generateWarning(`Invalid input provided. Fields - ${invalidFields} were not provided.`, codes.INPUT_INVALID);
};

const _findCampaignWithParentTypeId = async (parentTypeToSearch, parentTypeIdToSearch, isActive) => {
	const where = {};

	typeof isActive === 'undefined' ? '' : where.active = isActive;
	where.parentType = parentTypeToSearch;
	where.parentTypeId = parentTypeIdToSearch;
	//where.mobileConfirmed = 1; // so we only search active users

	return await dal.findOne(db.campaignUserMapping, where);
};

const _saveCampaignData = async (_campaignData, userId, parentType, parentTypeId, requestSource) => {
	const invalidFields = util.missingRequiredFields('campaignUserMapping', _campaignData);
	//console.log("8.4");
	if (invalidFields === '') {
		// the fields are valid	
		//console.log("_campaignData",_campaignData);

		const campaignUserDataWithType = await _findCampaignWithParentTypeId(parentType, parentTypeId, true);
		//console.log("campaignUserDataWithType", campaignUserDataWithType);
		if (campaignUserDataWithType && campaignUserDataWithType.parentType === parentType) {
			return campaignUserDataWithType;
		}
		else {
			const campaignData = {
				userId: userId,
				parentType: parentType,
				parentTypeId: parentTypeId,

				source: _campaignData.utm_source ? _campaignData.utm_source : '',
				medium: _campaignData.utm_medium ? _campaignData.utm_medium : '',
				pubId: _campaignData.utm_pubId ? _campaignData.utm_pubId : '',
				name: _campaignData.utm_campaign ? _campaignData.utm_campaign : '',
				term: _campaignData.utm_term ? _campaignData.utm_term : '',
				content: _campaignData.utm_content ? _campaignData.utm_content : '',

				createdBy: userId,
				updatedBy: userId,
				active: true,
			};
			//console.log("campaignData",campaignData);
			const campaignUserData = await dal.saveData(db.campaignUserMapping, campaignData);

			return campaignUserData;
		}
	}
	//console.log("LR 17");
	// invalid fields found. Return and throw an error
	throw util.generateWarning(`Invalid input provided. Fields - ${invalidFields} were not provided.`, codes.INPUT_INVALID);
};

/**
 *
 * @param {*} userId
 * @param {*} token
 *
 *
 *
 *
 */

const _verifyFacebookTokenAndGetUserData = async (email, facebookUserId, token) => {
	const result = await fetch.get(constants.FACEBOOK.AUTH_URL + token);
	const facebookWrapper = typeof result === 'string' ? JSON.parse(result) : result;

	// verify the email, userid, and token

	if (facebookWrapper.name && facebookWrapper.email && facebookWrapper.id) {
		if (facebookUserId === facebookWrapper.id && facebookWrapper.email === email) {
			const profilePic = constants.FACEBOOK.PICTURE_URL.replace('<%userid>', facebookUserId);
			const name = facebookWrapper.name;

			const names = name.split(' ');

			let firstName = '';
			let lastName = '';

			if (names.length === 1) {
				firstName = names[0];
			} else if (names.length === 2) {
				firstName = names[0];
				lastName = names[1];
			} else if (names.length > 2) {
				firstName = names[0];
				names.splice(0);

				lastName = names.join(' ');
			}

			return {
				firstName,
				lastName,
				profilePic,
				email,
			};
		}

		const error = util.generateWarning(messages.CANNOT_READ_TOKEN, codes.TOKEN_CANNOT_VERIFY);
		throw error;
	} else {
		const error = util.generateWarning(messages.CANNOT_READ_TOKEN, codes.TOKEN_MISSING_VALUES);
		throw error;
	}
};


const _verifyGoogleTokenAndGetUserData = async (email, token) => {

	const result = await fetch.get(constants.GOOGLE.AUTH_URL + token);
	const googleWrapper = result;

	/**
	   * we should verify email and the app ID
	   */

	if (googleWrapper.email && googleWrapper.azp && googleWrapper.azp) {
		// match both the values

		if (googleWrapper.email.toLowerCase() === email.toLowerCase() && googleWrapper.azp === constants.GOOGLE.APP_ID) {
			// now  verify the google token

			const utcSeconds = googleWrapper.azp;
			const expiresAt = new Date(0); // The 0 there is the key, which sets the date to the epoch
			expiresAt.setUTCSeconds(utcSeconds);

			if (new Date() > new Date(expiresAt)) {
				// token is already expired
				const error = util.generateWarning('Google token has been expired.', codes.TOKEN_AUTH_EXPIRED);
				throw error;
			}

			// ok, this seems a valid request return user data
			return {
				firstName: googleWrapper.given_name,
				lastName: googleWrapper.family_name,
				profilePic: googleWrapper.picture,
				email,
			};
		}


		// invalid token

		const error = util.generateWarning(messages.CANNOT_AUTHENTICATE_TOKEN, codes.TOKEN_CANNOT_VERIFY);
		throw error;
	} else {
		const error = util.generateWarning(messages.CANNOT_READ_TOKEN, codes.TOKEN_MISSING_VALUES);
		throw error;
	}
};

const _generateHashCode = (email) => {
	const hashExpiresAt = util.dateAdd(new Date(), 'second', config.VERIFICATION_HASH_ALLOWED_FOR_HOW_LONG_SECONDS);
	const hashWrapper = { email, type: constants.ECRYPTIONTYPES.ACTIVATION_HASH, expiresAt: hashExpiresAt };
	return encryptionHelper.encryptText(JSON.stringify(hashWrapper));
};

/**
  * @api {post} /api/account/login Login
  * @apiName Login
  * @apiGroup Account

  *
  * @apiDescription Allows user to login a user through our login platform, or through the social auth. The logic is like below:
  *  If auth type is provided, then it picks up authenticate social, otherwise it goes through normal route
	<code>
  * if (req.body.authType === 'google' || req.body.authType === 'facebook') {
		user = await _authenticate_social(req.body);
	}
	else {
		user = await _authenticate(req.body.email, req.body.password);
	}
	</code>
  *
  * @apiParam {String} email
  * @apiParam {String} password
  * @apiParam {String} token The token generated after social auth
  * @apiParam {Integer} facebookUserId (only for facebook auth)
  * @apiParam {String} authType The authentication source - google/facebook
  * @apiParam {String} source the source, like shopping or staking
  * @apiParam {String} oprKey the mandatory opr key for all open requests to avoid phishing attacks
  * E
  *
  * @apiSuccess {Integer}   code            the custom code... 200 for success and Error codes for error.
  * @apiSuccess {Boolean}   success         true means the request worked as expected
  * @apiSuccess {String}   message          the message from the API , can be used to display as a info to user
  * @apiSuccess {Object}   data             the user object
  * @apiSuccess {String}  data.token
  * @apiSuccess {String}  data.refreshToken
  * @apiSuccess {DateTime}  data.expires
  * @apiSuccess {Object}  data.user          the user object
  * @apiSuccess {String}  data.user.id          Id of the user
  * @apiSuccess {String}  data.user.title
  * @apiSuccess {String}  data.user.firstName
  * @apiSuccess {String}  data.user.lastName
  * @apiSuccess {String}  data.user.middleName
  * @apiSuccess {String}  data.user.email
  * @apiSuccess {String}  data.user.mobile
  * @apiSuccess {Boolean}  data.user.subscribedToShopping
  * @apiSuccess {Boolean}  data.user.subscribedToCoaching
  * @apiSuccess {Boolean}  data.user.subscribedToANAND
  * @apiSuccess {Boolean}  data.user.emailConfirmed
  * @apiSuccess {Boolean}  data.user.mobileConfirmed

  *
  *
  * @apiError Error-Code-354 The associated info of the user cannot be verified
  * @apiError Error-Code-355 After decrypting token, we couldn't find the required fields
  * @apiError Error-Code-307 Email couldn't be found
  * @apiError Error-Code-331 Password incorrect
  *
*/

const authenticate = async (req, res) => {
	let user;
	//console.log('dihary');
	const body = {
		...req.body,
		source: req.appName
	};


	try {

		//console.log("api req 1 - body ", req.body);

		if (req.body.authType === 'google' || req.body.authType === 'facebook') {
			// required fields check
			//console.log("------------------login_social-------------------");
			if (util.missingRequiredFields('login_social', req.body, res) === '') user = await _authenticate_social(body, req.HostName);
		}
		else if (req.body.authType === 'login_OTP') {
			// required fields check
			//console.log("-------------------login_OTP----------------------");
			if (util.missingRequiredFields('login_OTP', req.body, res) === '') user = await _authenticate_OTP(body, req.HostName);
		}
		else {
			// required fields check
			//	console.log("----------------------------login -------------------------------------");
			if (util.missingRequiredFields('login', req.body, res) === '') user = await _authenticate(req.body.email, req.body.password, req.HostName, req.body.socialauth, req.body.dataPublicIP);
		}
		//('recevied from social: ', user);

		// const userData = {
		// 	id: user.id,
		// 	unSuccessfullLoginCount: 0,
		// 	isUserLocked: 0
		// };
		// dal.saveData(db.user, userData);

		// authenticated successfully. Now let's store a refresh token. First, let's create a token
		const refreshToken = encryptionHelper.randomBytes(40, 'base64');

		const dataToSave = {
			refreshToken,
			email: user.employeeMaster.email,
			userId: user.id,
		};


		//console.log('test: ', user);

		//	const vendor = user.vendor;

		//console.log('vendor: ', vendor);

		await db.token.create(dataToSave);

		// token saved successfully. Now we will just return back the data
		// let's create a JWT Token

		const tokenExpiresAt = util.dateAdd(new Date(), 'hour', 2);

		const authToken = util.jwtService.createJWT({
			email: user.employeeMaster.email,
			userId: user.id,
			employeeName: user.employeeMaster.employeeName,
			injectedKey: config.INJECTED_KEY,
			appName: req.appName,
		}, config.TOKEN_ALLOWED_FOR_HOW_LONG);



		requestType = constants.TEMPLATES.TYPES.LOGIN_SUCCESS.EMAIL;
		const emailResult = await emailService.sendEmailWithTemplate(undefined, `${requestType}`, { name: `${user.firstName}` + " " + `${user.lastName}`, password: req.body.password }, user.email, 'Password delivered successfully');
		//console.log("user data : ", user);

		const authPacket = {
			token: authToken,
			refreshToken,
			exipres: tokenExpiresAt,
			user: {
				id: user.id,
				employeeName: user.employeeMaster.employeeName,
				email: user.employeeMaster.email,
				mobile: user.employeeMaster.mobile,
				userRoles: user.userRoles
			},
		};

		//console.log('auth package: ', user.password);

		responseHelper.success(res, 200, authPacket, messages.LOGGED_IN_SUCCESSFULLY);
	}
	catch (error) {
		//	console.log('error: ', error);
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'Authentication Error');
	}
};

/**
 *
 * @param {*} req
 * @param {*} res
 */

/**
 * @api {post} /api/account/register Register user
 * @apiName Register
 * @apiGroup Account

 *
 * @apiDescription Registers a new user.
 *
 * @apiParam {String} title Title of the registering person
 * @apiParam {String} firstName First Name
 * @apiParam {String} lastName Last name
 * @apiParam {String} email The unique email address to be used for auth later on
 * @apiParam {String} password
 * @apiParam {String} address1
 * @apiParam {String} address2
 * @apiParam {String} city
 * @apiParam {String} state
 * @apiParam {String} zip
 * @apiParam {String} country
 * @apiParam {String} mobile
 * @apiParam {String} phone
 * @apiParam {String} gender
 * @apiParam {String} profilePic
 * @apiParam {String} source Source like Staking/Shopping/
 * @apiParam {Date} dob Date Of birth
 * @apiParam {Date} doj Date of Joining the platform
 *
 * @apiSuccess {Integer}   code            the custom code 200 for success.
 * @apiSuccess {Boolean}   success         true means the request worked as expected
 * @apiSuccess {String}   message          the message from the API , can be used to display as a info to user
 * @apiSuccess {Object}   data             the user object
 * @apiSuccess {Integer}  data.ed          Id of the user
 * @apiSuccess {Integer}  data.email       Email of the user
 *
 * @apiError Error-Code-391 Required fields not present
 * @apiError Error-Code-309 Email already exists with the social auth
 * @apiError Error-Code-305 Email already exists
 * @apiError Error-Code-305-1 Phone already exists
 * @apiError Error-Code-381 Couldn't send otp
 *
*/


const register = async (req, res) => {
	try {
		const user = await _register(req.body, req.user ? req.user.id : -1, req.access, req.oprRequest, req.appName);

		// send OTP to user on their mobile and email
		// send res as null coz we don't wanna send the response yet

		const code = util.generateRandomCode(config.OTP_LENGTH);

		await otp._generateAndSendOTP(null, user.id, user.mobile, 'mobile', constants.OTP.REQUEST_TYPES.REGISTRATION, code, user.firstName);

		await otp._generateAndSendOTP(null, user.id, user.email, 'email', constants.OTP.REQUEST_TYPES.REGISTRATION, code, user.firstName);

		// coming here means that the user has been registered successfully.
		responseHelper.success(res, 200, { id: user.id, email: user.email }, messages.REGISTERED_SUCCESSFULLY);

		return user;
	} catch (error) {
		responseHelper.error(res, error, error.code ? error.code : 502, 'Registering user');
	}
};

const registerLogin = async (req, res) => {
	try {
		//console.log("register Login req body", req.body)
		//console.log("1");
		let _userData = [];
		if (req.body.loginOrRegister === "register") {
			if (req.body.userNameType === "mobile") {
				_userData = await _findVerifiedUserWithMobile(req.body.userName, true);
				if (_userData && _userData.mobile === req.body.userName) {
					throw util.generateWarning(messages.PHONE_ALREADY_EXISTS, codes.PHONE_ALREADY_EXISTS);
				}
			}
			else if (req.body.userNameType === "email") {
				_userData = await _findVerifiedUserWithEmail(req.body.userName);
				if (_userData && _userData.email === req.body.userName) {
					throw util.generateWarning(messages.EMAIL_ALREADY_EXISTS, codes.EMAIL_ALREADY_EXISTS);
				}
			}
		}
		else if (req.body.loginOrRegister === "login") {
			if (req.body.userNameType === "mobile") {
				_userData = await _findVerifiedUserWithMobile(req.body.userName, true);
				if (!_userData || _userData.mobile !== req.body.userName) {
					throw util.generateWarning(messages.PHONE_DOESNOT_EXIST, codes.PHONE_DOESNOT_EXIST);
				}
			}
			else if (req.body.userNameType === "email") {
				_userData = await _findVerifiedUserWithEmail(req.body.userName);
				if (!_userData || _userData.email !== req.body.userName) {
					throw util.generateWarning(messages.EMAIL_DOESNOT_EXIST, codes.EMAIL_DOESNOT_EXIST);
				}
			}
		}

		//console.log("8");
		const user = await _registerLogin(req.body, req.user ? req.user.id : -1, req.access, req.oprRequest, req.appName);

		// let's save compain data
		if (user && (user.loginCount === 0 || user.loginCount === undefined || user.loginCount === null) && req.body.campaignData !== undefined) {
			//console.log("8.1");
			//console.log(req.body.campaignData);
			const campaignData = JSON.parse(req.body.campaignData);
			//console.log("8.3");
			await _saveCampaignData(campaignData, user.id, "Registration", user.id, req.appName);
		}

		// send OTP to user on their mobile and email
		// send res as null coz we don't wanna send the response yet

		const code = util.generateRandomNumberCode(config.OTP_LENGTH);
		//console.log("9");
		if (req.body.userNameType === "email") {
			//console.log("email otp");
			await otp._generateAndSendOTP(null, user.id, user.email, 'email', constants.OTP.REQUEST_TYPES.REGISTRATION, code, "User");
		}
		else {
			//console.log("mobile otp");
			await otp._generateAndSendOTP(null, user.id, user.mobile, 'mobile', constants.OTP.REQUEST_TYPES.REGISTRATION, code, "User");
		}
		//console.log("register Login success");
		// coming here means that the user has been registered successfully.
		responseHelper.success(res, 200, { id: user.id, email: user.email }, messages.REGISTERED_SUCCESSFULLY);

		return user;
	} catch (error) {
		//console.log("15");
		responseHelper.error(res, error, error.code ? error.code : 502, 'Registering user');
	}
};

const updateProfile = async (req, res) => {
	try {
		//console.log("update profile body ", req.body);
		const body = {
			...req.body,
			source: req.appName
		};

		const user = await _updateProfile(req.body, req.user ? req.user.id : -1, req.access, req.oprRequest, req.appName);

		//console.log("user profile has been updated !");
		// authenticated successfully. Now let's store a refresh token. First, let's create a token
		const refreshToken = encryptionHelper.randomBytes(40, 'base64');

		const dataToSave = {
			refreshToken,
			email: user.email,
			userId: user.id,
		};


		//console.log('test: ', user);

		// take the cart from temp to the user synchronously
		if (body.tempUserId) {
			db.sequelize.query('call shift_cart_to_user(:temp_user_id, :user_id)', { replacements: { temp_user_id: body.tempUserId, user_id: user.id } }).then(results => {
				//console.log('cart shifted successfully');
			}).catch(err => {
				//console.log('error hai: ', err);
			});
		}


		const vendor = user.vendor;

		//console.log('vendor: ', vendor);

		await db.token.create(dataToSave);

		// token saved successfully. Now we will just return back the data
		// let's create a JWT Token

		const tokenExpiresAt = util.dateAdd(new Date(), 'hour', 2);

		const authToken = util.jwtService.createJWT({
			email: user.email,
			userId: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			injectedKey: config.INJECTED_KEY,
			appName: req.appName,
			vendorId: user.vendor ? user.vendor.id : 'not-a-vendor'
		}, config.TOKEN_ALLOWED_FOR_HOW_LONG);


		const subscriptions = user.subscriptionUserMappings;
		let subscription = undefined;

		if (subscriptions && Array.isArray(subscriptions)) {
			const filtered = subscriptions.filter(mapping => mapping.subscriptionStatus === 'active');

			if (filtered.length > 0) {
				subscription = filtered[0];
			}
		}

		const authPacket = {
			token: authToken,
			refreshToken,
			exipres: tokenExpiresAt,
			user: {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				middleName: user.middleName,
				title: user.title,
				email: user.email,
				mobile: user.mobile,
				profilePic: user.profilePic,
				subscribedToCoaching: user.subscribedToCoaching,
				subscribedToShopping: user.subscribedToShopping,
				mobileConfirmed: user.mobileConfirmed,
				emailConfirmed: user.emailConfirmed,
				addresses: user.addresses,
				subscription,
				referralCode: user.referralCode,
				rewardPoints: user.rewardPoints ? user.rewardPoints : 0,
				userType: user.userType,
				socialAuth: (user.password === null || (typeof user.password === 'undefined') || (user.password.trim().length === 0)),
				loginCount: user.loginCount,
				authType: user.authType
			},
		};

		//console.log('auth package: ', user.password);
		responseHelper.success(res, 200, authPacket, messages.LOGGED_IN_SUCCESSFULLY);

		// coming here means that the user has been registered successfully.
		//responseHelper.success(res, 200, { id: user.id, email: user.email }, messages.PROFILEUPDATED_SUCCESSFULLY);
		//return user;
	} catch (error) {
		responseHelper.error(res, error, error.code ? error.code : 502, 'Registering user');
	}
};

const resendOTP = async (req, res) => {
	try {
		//console.log("register Login req body", req.body)

		const code = util.generateRandomNumberCode(config.OTP_LENGTH);
		if (req.body.userNameType === "email") {
			//console.log("email otp");
			await otp._generateAndSendOTP(null, req.body.userId, req.body.userName, 'email', constants.OTP.REQUEST_TYPES.REGISTRATION, code, "User");
		}
		else {
			//console.log("mobile otp");
			await otp._generateAndSendOTP(null, req.body.userId, req.body.userName, 'mobile', constants.OTP.REQUEST_TYPES.REGISTRATION, code, "User");
		}
		//console.log("OTP re-sent successfully");
		// coming here means that the user has been registered successfully.
		responseHelper.success(res, 200, { id: req.body.userId, userName: req.body.userName }, "OTP re-sent successfully");
	} catch (error) {
		//("15");
		responseHelper.error(res, error, error.code ? error.code : 502, 'Resend OTP');
	}
};

const registerFreeTrial = async (req, res) => {
	try {
		const code = util.generateRandomCode(config.OTP_LENGTH);
		req.body.password = code;
		const user = await _register(req.body, req.user ? req.user.id : -1, req.access, req.oprRequest, req.appName);

		// send OTP to user on their mobile and email
		// send res as null coz we don't wanna send the response yet

		requestType = 'password-freetrial-mobile';
		emailRequestType = 'password-freetrial-email';

		await otp._generateOTP(null, user.id, user.mobile, 'mobile', constants.OTP.REQUEST_TYPES.FREETRIAL_PASSWORD, code, user.firstName);
		await otp._generateOTP(null, user.id, user.email, 'email', constants.OTP.REQUEST_TYPES.FREETRIAL_PASSWORD, code, user.firstName);

		await otp._SendOTP(null, user.id, user.mobile, 'mobile', constants.OTP.REQUEST_TYPES.FREETRIAL_PASSWORD, code, user.firstName);

		// coming here means that the user has been registered successfully.
		responseHelper.success(res, 200, { id: user.id, email: user.email }, messages.REGISTERED_SUCCESSFULLY);
		return user;
	} catch (error) {
		responseHelper.error(res, error, error.code ? error.code : 502, 'Registering user');
	}
};

/**

 * @api {post} /api/account/forgotPassword Forgot Password
 * @apiName forgotPassword
 * @apiGroup Account

 * @apiDescription It sends the OTP to registered mobile/email. Please note that first it tries to find the user with mobile, and then by email. If we are able to find a user with mobile, we will then use the found user's mobile and email to send OTP.


 * @apiParam {String} mobile Either email or phone number is required to retrieve password. Phone is given preference over Email if both supplied
 * @apiParam {String} email Either email or phone number is required to retrieve password. Phone is given preference over Email if both supplied

 * @apiSuccess {Integer}   code  The code of the response/error. 200 means the request is successful
 * @apiSuccess {String}   message  The message from the API. It can be used for displaying it to the user.
 * @apiSuccess {Object}   data  The data packet, where all the requests will be abstracted
 * @apiSuccess {String}   data.userId  The Id of the user found in the system.

 * @apiError Error-Code-391 The user is not found with either email or mobile.
 * @apiError Error-Code-309 The user is registered through Social Auth
 * @apiError Error-Code-381 Error in sending OTP. <code>message<code> will contain description
 * @apiError Error-Code-308 The error in sending email. Check <code>message<code> for further information
 */

const forgotPassword = async (req, res) => {
	try {
		// check if user id exists or not
		let user;

		if (req.body.mobile) {
			user = await _findUserWithMobile(req.body.mobile);
		} else if (req.body.email) {
			user = await _findUserWithEmail(req.body.email);
		} else {
			responseHelper.error(res, new Error(messages.PROVIDE_EMAIL_MOBILE), codes.INPUT_INVALID, 'forgot password');
		}


		if (user) {
			// if the user is google/facebook user, tell him to login from that login
			if (!user.password || user.password === '' || typeof user.password === 'undefined') {
				// it is a social auth user
				throw util.generateWarning(messages.EMAIL_REGISTERED_SOCIAL, codes.EMAIL_ALREADY_EXISTS_SOCIAL_AUTH);
			}

			// if not, let's send the OTP
			let userName = user.firstName + " " + user.lastName;
			const code = util.generateRandomCode(config.OTP_LENGTH);

			if (user.email) {
				await otp._generateAndSendOTP(undefined, user.id, user.email, 'email', constants.OTP.REQUEST_TYPES.FORGOT_PASSWORD, code, userName);
			}

			if (user.mobile) {
				await otp._generateAndSendOTP(undefined, user.id, user.mobile, 'mobile', constants.OTP.REQUEST_TYPES.FORGOT_PASSWORD, code, userName);
			}

			// if it comes here, it means the otp has been delivered. Otherwise the error will come and the control
			// will not come here

			responseHelper.success(res, 200, { userId: user.id }, messages.OTP_SENT_EMAIL_MOBILE);
		}
		else {
			const error = util.generateWarning(messages.USER_ID_NOT_FOUND, codes.ID_NOT_FOUND);
			throw error;
		}
	}
	catch (error) {
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'resetting password');
	}
};

/**

 * @api {post} /api/account/resetPassword Reset password
 * @apiName ResetPassword
 * @apiGroup Account

 * @apiDescription For refreshing password, we will need to use password token. While verifying the otp, you will be sent a password token in response. You will need to send this in the body so we can authenticate the request


 * @apiParam {String} userId
 * @apiParam {String} passwordToken
 * @apiParam {String} password
 * @apiParam {String} confirmPassword

 * @apiSuccess {Integer}   code  The code of the response/error. 200 means the request is successful and password is updated
 * @apiSuccess {String}   message  The message from the API. It can be used for displaying it to the user.
 * @apiSuccess {Object}   data  Not Used

 * @apiError Error-Code-301 The user is not found with the Id. Id may be incorrect.
 * @apiError Error-Code-354 The password token cannot be verified after decrypting. It will mostly mean that the user id you sent in request is different from the user id for which this token was originally issued to.
 * @apiError Error-Code-352 Password token expired
 * @apiError Error-Code-353 Token is corrupted or messed up
 * @apiError Error-Code-355 The token didn't have expected values after decrypting. It seems it was tampered with
 * @apiError Error-Code-333 Password not provided
 * @apiError Error-Code-334 Password and confirm password do not match
 * @apiError Error-Code-309 The user is registered through Social Auth so cannot update the password.
 */

const resetPassword = async (req, res) => {
	try {
		// verify the token

		const { password, confirmPassword } = req.body;

		const tokenObject = JSON.parse(encryptionHelper.decryptText(req.body.passwordToken));

		if (tokenObject && tokenObject.userId && tokenObject.key && tokenObject.expiresAt) {
			if (tokenObject.userId !== req.body.userId) {
				// invalid token
				throw util.generateWarning(messages.INVALID_PASSWORD_TOKEN, codes.TOKEN_CANNOT_VERIFY);
			}

			// check if it has not been expired

			if (new Date() > new Date(tokenObject.expiresAt)) {
				// expired
				throw util.generateWarning(messages.EXPIRED_PASSWORD_TOKEN, codes.TOKEN_AUTH_EXPIRED);
			}

			if (tokenObject.key !== config.INJECTED_KEY) {
				// expired
				throw util.generateWarning(messages.INVALID_PASSWORD_TOKEN, codes.TOKEN_AUTH_CORRUPTED);
			}

			// token ok
		} else {
			throw util.generateWarning(messages.INVALID_PASSWORD_TOKEN, codes.TOKEN_MISSING_VALUES);
		}

		if (!password || typeof password === 'undefined') {
			throw util.generateWarning(messages.INVALID_PASSWORD, codes.PASSWORD_NOT_PROVIDED);
		}

		if (password !== confirmPassword) {
			throw util.generateWarning(messages.PASSWORD_CONFIRM_NO_MATCH, codes.PASSWORD_NOT_MATCHED);
		}

		// check if user id exists or not
		const user = await _findUserWithId(req.body.userId);

		if (user) {
			// if the user is google/facebook user, tell him to login from that login
			if (user.password === '' || typeof user.password === 'undefined') {
				// it is a social auth user
				throw util.generateWarning(messages.EMAIL_REGISTERED_SOCIAL, codes.EMAIL_ALREADY_EXISTS_SOCIAL_AUTH);
			}

			// save the user with new password

			const passwordSaltWrapper = encryptionHelper.hashPassword(password);

			const userData = {
				id: user.id,
				password: passwordSaltWrapper.password,
				passwordSalt: passwordSaltWrapper.salt,
			};

			await dal.saveData(db.user, userData);

			responseHelper.success(res, 200, {}, messages.PASSWORD_UPDATED);
		} else {
			const error = util.generateWarning(messages.USER_ID_NOT_FOUND, codes.ID_NOT_FOUND);
			throw error;
		}
	} catch (error) {
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'resetting password');
	}
};

/**

 * @api {post} /api/account/refreshToken Refresh token
 * @apiName refreshToken
 * @apiGroup Account

 * @apiDescription If the token is expired, you will need to submit a request with the refresh token, and it will return a new auth token

 * @apiParam {String} email
 * @apiParam {String} refreshToken

 * @apiSuccess {Integer}   code  The code of the response/error
 * @apiSuccess {String}   message  The message from the API. It can be used for displaying it to the user.
 * @apiSuccess {Object}   data  The data packet, where all the requests will be abstracted
 * @apiSuccess {String}   data.token  The token to send requests again.

 * @apiError Error-Code-351 The refresh token provided cannot be validated.
 */

const refreshToken = (req, res) => new Promise((resolve, reject) => {
	_refreshToken(req.body.email, req.body.refreshToken).then((token) => {
		responseHelper.success(res, 200, { token }, messages.TOKEN_REFRESH_SUCCESSFULL);
		resolve(token);
	}).catch((error) => {
		responseHelper.error(res, error, error.code ? error.code : 502, 'Refresh Token');
		reject(error);
	});
});

/**

 * @api {post} /api/account/tokenIsValid Validate token
 * @apiName TokenIsValid
 * @apiGroup Account

 * @apiDescription Validates the auth token


 * @apiParam {String} token

 * @apiSuccess {Integer}   code  The code of the response/error. 200 means the Token is valid.
 * @apiSuccess {String}   message  The message from the API. It can be used for displaying it to the user.

 * @apiError Error-Code-352 Auth token is expired
 * @apiError Error-Code-353 Auth token is corrupted/incorrect
 */

const tokenIsValid = (req, res) => {
	const decoded = util.tokenIsValid(req.body.token);

	if (decoded.isError) {
		responseHelper.error(res, decoded.error, decoded.error.code, 'Token validation');
	} else {
		responseHelper.success(res, 200, {}, messages.TOKEN_VALID);
	}
};

/**
 *
 * @param {*} req
 * @param {*} res
 *
 * For normal Auth
 * {
 *      email: 'vikasbhandari2@gmail.com',
 *      password: 'password'
 * }
 *
 * for social Auth
 * {
 *      email: 'vikasbhandari2@gmail.com',
 *      firstName: '',
 *      lastName: '',
 *      facebookUserId: '' // only for facebook login
 *      token: '',
 *      authType: 'google' / 'facebook' one of it,
 *      source: 'Shopping'
 *
 * }
 */

const saveUser = async (req, res) => {
	try {
		let user = req.body;
		let userq = req.body;
		const userRoles = user.userRoles;
		if (user.roleMasterIds) delete user.roleMasterIds;
		let CreatedBy = req.user ? req.user.id : undefined;
		let _user = undefined;
		console.log("request :", req);
		console.log("userq :-------------", userq);
		if (user.id) {
			delete user.password
			_user = await _findUserWithId(user.id);
		}
		if (_user && _user.id === req.user.id) {
			const newData = user;

			user = {
				..._user.dataValues,
				...newData
			};
			//console.log("save user 4 ")
		}
		else {
			let wheres = null;

			wheres = {
				isActive: 1,
				employeeId:userq.employeeId ,
				[Op.or]: [{ username: userq.userName, }]
			};
			const include = [{
				model: db.userRole, as: 'userRoles',
				where: {
					isActive: 1
				},
				required: false
			}];
			const _userWithEmail = await dal.findOne(db.user,
				wheres,
				true,
				include
			);
			//console.log("save user 6 ", _userWithEmail)
			if (_userWithEmail) {
				let MasterName = "username already exist";
				throw util.generateWarning(MasterName, codes.EMAIL_ALREADY_EXISTS);
			}
		}
		//console.log('saving: ');

		user.isActive = true;
		// hash the password for security
		if (!user.id) {
			const passwordSaltWrapper = encryptionHelper.hashPassword(user.password);
			user.password = passwordSaltWrapper.password;
			user.saltPassword = passwordSaltWrapper.salt;
		}
		user.accessGroupId = process.env.DEFAULT_USER_GROUP;
		let roleMasterId = user && user.userRoles && user.userRoles.length > 0 && user.userRoles[0];
		let username = user && user.userName;
		user.roleId = roleMasterId;
		user.username = username;
		const userSaveResult = await dal.saveData(db.user, user, undefined, req.user ? req.user.id : -1);
		//console.log("User userSaveResult Details", userSaveResult)
		console.log("userSaveResult.id", userSaveResult.id)
		if (userSaveResult.id) {
			try {
				let DataUserroles = await getUserRoleByUserId(userSaveResult.id);
				//console.log("User Role Details", DataUserroles)
				if (DataUserroles && DataUserroles.length > 0) {
					await db.userRole.update(
						{
							isActive: 0
						},
						{
							where: {
								isActive: 1,
								userId: userSaveResult.id
							}
						})
				}
			}
			catch (error) {
			}
			console.log("userSaveResult.id :---------------", userSaveResult.id)
			console.log("userRoles :----------------", userRoles)
			userRoleResult = await saveUserRoles(userSaveResult.id, userRoles, req.user ? req.user.id : -1);
		}
		responseHelper.success(res, codes.SUCCESS, userSaveResult.id, messages.USER_SAVED, userSaveResult.id, 1);
	} catch (error) {
		//console.log("save user error ")
		responseHelper.error(res, error, error.code, 'Updating user error !!');
	}
};

const getUserRoleByUserAndRoleId = async (userId, Roles, createdBy) => {
	try {
		console.log("userId : -----------", userId)
		console.log("getUserRoleByUserAndRoleId : -----------", Roles)
		const where = {
			userId: userId,
			roleId: Roles
		};

		//where.userId = userId;
		//where.roleId = Roles;
		console.log("where -------------- ", where);
		const userRoleResult = await dal.findOne(db.userRole, where, true);
		console.log("getUserRoleByUserAndRoleId 1 : -----------", Roles)
		return userRoleResult;
	} catch (error) {
		//responseHelper.error(undefined, error, error.code, 'Updating User role');
		//console.log("user role log error : ", error);
		return undefined
	}
}

const getUserRoleByUserId = async (userId) => {
	try {

		let where = [];
		where.push(util.constructWheresForSequelize('isActive', 1));
		where.push(util.constructWheresForSequelize('userId', userId));


		const userRoleResult = await dal.getList({ model: db.userRole, where: where, order: [['createdAt', 'desc']], include: false });
		return userRoleResult;
	} catch (error) {
		//	console.log("user role log error : ", error);
		return undefined
	}
}

const saveUserRoles = async (userId, Roles, createdBy) => {
	try {
		let userRoleResult = undefined;
		console.log("Roles :------------", Roles);
		if (Roles && Roles.length > 0) {
			for (let element of Roles) {
				let userRoleExist = await getUserRoleByUserAndRoleId(userId, element);
				console.log("userRoleExist :", userRoleExist)
				//console.log("userRoleExist : ", userRoleExist);
				if (!userRoleExist) {
					let userRoles = {
						userId: userId,
						roleId: element,
						isActive: 1,
						isBlocked:0
					}
					console.log("userRoles : --------",userRoles);
					userRoleResult = await dal.saveData(db.userRole, userRoles, undefined, createdBy);
					console.log("userRoleResult : --------",userRoleResult);
				}
				else if (userRoleExist) {
					let userRoles = {
						id: userRoleExist.id,
						userId: userId,
						roleId: element,
						isActive: 1,
						isBlocked:0
					}
					userRoleResult = await dal.saveData(db.userRole, userRoles, undefined, createdBy);
				}
			};
		}
		return userRoleResult;
	} catch (error) {
		//responseHelper.error(undefined, error, error.code, 'Updating User role');
		//	console.log("user role log error : ", error);
		return undefined
	}
}

const deleteUser = async (req, res) => {
	try {
		//console.log("delete user req : ", req);
		if (!req.query.id) {
			throw util.generateWarning(`Please provide user id`, codes.ID_NOT_FOUND);
		}
		console.log("req.query.id : *********",req.query.id);
		dal.deleteRecords(db.user, req.query.id, req.user.id, res);
	}
	catch (error) {
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting user details');
	}
};

const unLockAccount = async (req, res) => {
	let user;
	//console.log('dihary');
	const body = {
		...req.body,
		source: req.appName
	};

	try {

		//console.log("api req 1 - body ", req.body);

		const user = await _findUserWithId(req.body.id);
		const passwordSaltWrapper = encryptionHelper.hashPassword(req.body.password);
		const password = passwordSaltWrapper.password;
		const passwordSalt = passwordSaltWrapper.salt;

		const userData = {
			id: user.id,
			unSuccessfullLoginCount: 0,
			isUserLocked: 0,
			password: password,
			passwordSalt: passwordSalt
		};
		dal.saveData(db.user, userData);
		requestType = 'account-unlocked';
		const emailResult = await emailService.sendEmailWithTemplate(undefined, `${requestType}`, { name: `${req.body.firstName}` + " " + `${req.body.lastName}`, password: req.body.password }, req.body.email, 'Password delivered successfully');
		//console.log('auth package: ', user.password);
		responseHelper.success(res, 200, {}, 'Account unlocked successfully');
	}
	catch (error) {
		//console.log('error: ', error);
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'Authentication Error');
	}
};

const changePassword = async (req, res) => {
	try {
		/**
		 * for changing password, we need to make sure that the password is matched first.
		 */

		// let's find the user first
		const user = await _findUserWithId(req.user.id);

		if (!user) {
			throw util.generateWarning(messages.USER_ID_NOT_FOUND, codes.ID_NOT_FOUND);
		}

		// user found, let's try to compare the password
		const passwordIsValid = encryptionHelper.validatePassword(req.body.password, user.password, user.passwordSalt);

		if (!passwordIsValid) {
			throw util.generateWarning(messages.INVALID_PASSWORD, codes.PASSWORD_INCORRECT);
		}

		// password matched. Now make sure the new passwords match

		if (req.body.newPassword !== req.body.confirmPassword) {
			throw util.generateWarning(messages.PASSWORD_CONFIRM_NO_MATCH, codes.PASSWORD_NOT_MATCHED);
		}

		// hash the password for security
		const passwordSaltWrapper = encryptionHelper.hashPassword(req.body.newPassword);


		// let's change the password. 

		const userData = {
			id: user.id,
			password: passwordSaltWrapper.password,
			passwordSalt: passwordSaltWrapper.salt
		};

		await dal.saveData(db.user, userData);

		responseHelper.success(res, 200, {}, 'Password updated successfully');
	} catch (error) {
		responseHelper.error(res, error, codes.ERROR, 'get user name');
	}
};

/**

 * @api {put} /api/user
 * @apiName /api/user(put)
 * @apiGroup user

 * @apiDescription


 * @apiParam {Integer} rowsToReturn
 * @apiParam {Integer} pageIndex

 * @apiSuccess {Integer}   code  The code of the response/error. 200 means the request is successful and save is successful
 * @apiSuccess {String}   message  The message from the API. It can be used for displaying it to the user.

 * @apiError Error-Code-403 Unauthorized.
 * @apiError Error-Code-375 URL Malformed, API tries to split the url by '/' and if it doesn't find the required format, ex, '/api/user/' then it is considered as malformed
 * @apiError Error-Code-352 Auth token is expired
 * @apiError Error-Code-353 Auth token is corrupted/incorrect
 * @apiError Error-Code-355 The token didn't have expected values after decrypting. It seems it was tampered with
 * @apiError Error-Code-301 The user is not found with the Id. Id may be incorrect.
 * @apiError Error-Code-381 Error in sending OTP. <code>message<code> will contain description. OTP will be sent if mobile or email is changed
 * @apiError Error-Code-308 The error in sending email. Check <code>message<code> for further information. OTP will be sent if mobile or email is changed
 */

const deleteRecord = async (req, res) => {
	try {
		const user = await _findUserWithId(req.params.id);

		if (!user) {
			// we couldn't find the user. Raise an error
			const error = util.generateWarning(messages.USER_ID_NOT_FOUND, codes.ID_NOT_FOUND);
			throw error;
		}

		await dal.deleteRecord(db.user, user.id, req.user.userId, res);
	} catch (error) {
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'deleting user');
	}
};

/**

 * @api {get} /api/user/getUsersByEventId/:eventId Get users for an Events
 * @apiName Get users for an Event
 * @apiGroup User

 * @apiDescription Gets the user for an event

 * @apiParam {String} eventId

 * @apiSuccess {Integer}   code  The code of the response/error. 200 means the request is successful and event was deleted successfully
 * @apiSuccess {String}   message  The message from the API. It can be used for displaying it to the user.
 * @apiSuccess {Object[]}   data  list of users
 * @apiSuccess {String} data.id
 * @apiSuccess {String} data.firstName
 * @apiSuccess {String} data.lastName
 * @apiSuccess {String} data.email
 * @apiSuccess {String} data.mobile
 * @apiSuccess {String} data.emailConfirmed
 * @apiSuccess {String} data.mobileConfirmed
 * @apiSuccess {String} data.eventSubscriptionId
 * @apiSuccess {Integer} data.bulletsNeeded
 * @apiSuccess {Double} data.buyInAmount
 * @apiSuccess {String} data.eventName

 * @apiError Error-Code-301 Cannot find the event with the ID.
 * @apiError Error-Code-403 Unauthorized.
 * @apiError Error-Code-375 URL Malformed, API tries to split the url by '/' and if it doesn't find the required format, ex, '/api/user/' then it is considered as malformed
 * @apiError Error-Code-352 Auth token is expired
 * @apiError Error-Code-353 Auth token is corrupted/incorrect
 * @apiError Error-Code-355 The token didn't have expected values after decrypting. It seems it was tampered with
 */

const getUsersByEventId = async (req, res) => {
	try {
		const eventId = req.params.eventId;
		const event = await dal.findById(db.event, eventId);

		if (!event) {
			// ok, no event found
			throw util.generateWarning('Cannot find Event with the passed Id', codes.ID_NOT_FOUND);
		}

		db.sequelize.query('CALL Get_Users_By_Event_Id(:eventId);', {
			replacements: { eventId },
		}).then((response) => {
			responseHelper.success(res, 200, response, '');
		}).error((err) => {
			throw err;
		});
	} catch (error) {
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'Get Users by Event');
	}
};

const getUserById = async (req, res) => {
	try {
		//console.log("user by id req : ", req);
		const user = await _findUserWithId(req.params.id);
		//console.log("user by id : ", user);
		if (user) {
			responseHelper.success(res, codes.SUCCESS, user);
		} else {
			const error = util.generateWarning(messages.USER_ID_NOT_FOUND, codes.ID_NOT_FOUND);
			throw error;
		}
	} catch (error) {
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'get user by id');
	}
};



/**

 * @api {get} /api/user gets the user list
 * @apiName /api/user(get)
 * @apiGroup user

 * @apiDescription Gets the users list, and allows pagination data


 * @apiParam {Integer} rowsToReturn
 * @apiParam {Integer} pageIndex

 * @apiSuccess {Integer}   code  The code of the response/error. 200 means the request is successful and password is updated
 * @apiSuccess {String}   message  Empty, no significance in this method
 * @apiSuccess {Object[]}   data
 * @apiSuccess {String}   data.id  User Id
 * @apiSuccess {String}   data.firstName
 * @apiSuccess {String}   data.lastName
 * @apiSuccess {String}   data.title
 * @apiSuccess {String}   data.gender
 * @apiSuccess {Date}   data.dob
 * @apiSuccess {Date}   data.doj
 * @apiSuccess {String}   data.address1
 * @apiSuccess {String}   data.city
 * @apiSuccess {String}   data.state
 * @apiSuccess {String}   data.mobile
 * @apiSuccess {String}   data.phone
 * @apiSuccess {String}   data.email
 * @apiSuccess {Boolean}   data.subscribedTo
 * @apiSuccess {Boolean}   data.subscribedToCoaching
 * @apiSuccess {Boolean}   data.subscribedToShopping
 * @apiSuccess {Integer}   count  Total number of users. For example, we may be returning 50 users in a request, this count will be showing the actual number of users in the DB. It will be used for your pagination

 * @apiError Error-Code-403 Unauthorized.
 * @apiError Error-Code-375 URL Malformed, API tries to split the url by '/' and if it doesn't find the required format, ex, '/api/user/' then it is considered as malformed
 * @apiError Error-Code-352 Auth token is expired
 * @apiError Error-Code-353 Auth token is corrupted/incorrect
 * @apiError Error-Code-355 The token didn't have expected values after decrypting. It seems it was tampered with
 */

const getUsers = async (req, res) => {
	try {

		const rowsToReturn = (req.query && req.query.rows) ? req.query.rows : undefined;
		const pageIndex = (req.query && req.query.pageIndex) ? req.query.pageIndex : undefined;

		let where = [];
		if (req.query.where) {
			where = JSON.parse(req.query.where.split('%22').join('\''));

			if (!Array.isArray(where)) {
				where = [];
			}
		}
		where.push(util.constructWheresForSequelize('active', 1));

		if (req.query.plantMasterId) {
			where.push(util.constructWheresForSequelize('plantMasterId', req.query.plantMasterId));
		}
		//console.log('req.app: ', req.appName, req.HostName);
		//console.log('User where condition', where);
		const users = await dal.getList({
			model: db.user, where, order: [['createdAt', 'desc']], include: true, rowsToReturn, pageIndex,
			includedAttributes: listAttributes.user
		});
		//console.log("get users : ", users);
		if (users && users.length > 0) {
			responseHelper.success(res, 200, users, '', -1, users.length);
		} else {
			responseHelper.success(res, 200, [], '', -1, 0);
		}
	} catch (error) {
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'get user list');
	}
};

const getUsersP = async (req, res) => {
	try {
		console.log("Get getUsersP req.query : ", req.query);
		db.sequelize.query('call asp_user_details_get_user_details(:userId, :roleMasterId)', {
			replacements: {
				userId: req.query.userId ? req.query.userId : '',
				roleMasterId: req.query.roleMasterId ? req.query.roleMasterId : ''
			}
		}).then(results => {
			//console.log("results : ", results);
			responseHelper.success(res, 200, results, 'User Details', '-1', results.length);
		}).catch(err => {
			responseHelper.error(res, err.code ? err.code : codes.ERROR, err, 'Error in getting user details');
		});
	}
	catch (error) {
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting User Details');
	}
};


const registerDevice = async (req, res) => {
	try {
		if (typeof req.user.id === 'undefined') {
			responseHelper.error(res, util.generateWarning('Id not found'), codes.ID_FOUND_POST_REQUEST)
		}

		const userDataToSave = {
			id: req.user.id,
			coaching_session_id: req.query.deviceId
		};

		await dal.saveData(db.user, userDataToSave, res, req.user.id);
	} catch (error) {
		responseHelper.error(res, error, codes.ERROR, 'registering device');
	}
};

const isDeviceRegistered = async (req, res) => {
	try {

		//console.log('requi: ', req.user.id);

		const user = await dal.findOne(db.user, {
			id: req.user.id,
			coaching_session_id: req.query.deviceId
		});

		if (!user) {
			return responseHelper.success(res, codes.DEVICE_NOT_REGISTERED, { registered: false });
		}

		responseHelper.success(res, 200, { registered: true });
	} catch (error) {
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'registering device');
	}
};



const getCurrentUserSessionDetails = async (req, res) => {
	try {
		db.sequelize.query('call Asp_CurrentSessionDetails_UserYearCentralDetails(:p_userMasterId, :p_plantMasterId, :p_companyMasterId )', {
			replacements: {
				p_userMasterId: req.query.userMasterId ? req.query.userMasterId : '',
				p_plantMasterId: req.query.plantMasterId ? req.query.plantMasterId : '',
				p_companyMasterId: req.query.companyMasterId ? req.query.companyMasterId : '',
			}
		}).then(results => {
			//console.log("results : ", results);ata
			const Top1Data = results && results[0];
			responseHelper.success(res, 200, Top1Data, 'User Details', '-1', 1);
		}).catch(err => {
			responseHelper.error(res, err.code ? err.code : codes.ERROR, err, 'Error in getting user details');
		});
	}
	catch (error) {
		responseHelper.error(res, error, error.code ? error.code : codes.ERROR, 'getting User Details');
	}
};


/** testing URLs => to be removed later on */
module.exports._register = _register;
module.exports._deleteRecord = _deleteRecord;
module.exports._deleteRecords = _deleteRecords;
module.exports._authenticate = _authenticate;
module.exports._refreshToken = _refreshToken;
module.exports._findUserWithMobile = _findUserWithMobile;
module.exports._findUserWithEmail = _findUserWithEmail;
module.exports._findVerifiedUserWithMobile = _findVerifiedUserWithMobile;
module.exports._findVerifiedUserWithEmail = _findVerifiedUserWithEmail;
module.exports._findUserWithId = _findUserWithId;
module.exports._findUserWithFacebookUserId = _findUserWithFacebookUserId;
module.exports._verifyGoogleTokenAndGetUserData = _verifyGoogleTokenAndGetUserData;
module.exports._verifyFacebookTokenAndGetUserData = _verifyFacebookTokenAndGetUserData;


/** api URLs */
module.exports.changePassword = changePassword;
module.exports.forgotPassword = forgotPassword;
module.exports.authenticate = authenticate;
module.exports.refreshToken = refreshToken;
module.exports.tokenIsValid = tokenIsValid;
module.exports.getUsers = getUsers;
module.exports.getUsersP = getUsersP;
module.exports.getUsersByEventId = getUsersByEventId;
module.exports.getUserById = getUserById;
module.exports.register = register;
module.exports.registerLogin = registerLogin;
module.exports.updateProfile = updateProfile;
module.exports.resendOTP = resendOTP;
module.exports.registerFreeTrial = registerFreeTrial;
module.exports.resetPassword = resetPassword;
module.exports.saveUser = saveUser;
module.exports.deleteRecord = deleteUser;
module.exports.unLockAccount = unLockAccount;
module.exports.registerDevice = registerDevice;
module.exports.isDeviceRegistered = isDeviceRegistered;

module.exports.getCurrentUserSessionDetails = getCurrentUserSessionDetails;