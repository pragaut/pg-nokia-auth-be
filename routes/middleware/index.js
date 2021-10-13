const user = require('../../controllers/user');
const responseHelper = require('../../util/response.helper');
const util = require('../../util');
const userAccess = require('../../controllers/userAccess');
const groupAccess = require('../../controllers/groupAccess');
const codes = require('../../util/codes').codes;
const config = require('../../config').config;
const accessConfig = require('../../config').accessConfig;


const verifyAccess = (accessLevel, requestType, method) => {

    switch (requestType) {
        case 'create':
        case 'update':
            return accessLevel >= 12;
        case 'delete':
            return accessLevel >= 20;
        case 'list':
            return accessLevel >= 1;
        default:
            // if we have come here, it means that we have a different request other than
            // simple get/put/delete/post

            // let's check if this requires any special access or not

            const specialAccess = accessConfig[requestType];

            if (specialAccess) {
                return accessLevel >= specialAccess.minimumAccess && accessLevel <= specialAccess.maximumAccess;
            }
            else {
                // special access is not here, so what we need to do is, we can assume that 
                // if a request is of get type, 1 is enough, post/put, 12 is enough, 20, delete is enough
                switch (method) {
                    case 'PUT':
                    case 'POST':
                        return accessLevel >= 12;
                    case 'DELETE':
                        return accessLevel >= 20;
                    case 'GET':
                        return accessLevel >= 1;
                }
            }
    }
};


const entry = async (req, res, next) => {
    try {
        const token = req.body.token || req.query.token || req.headers['authorization'] || req.headers['x-access-token'] ;
        console.log("User Login Entry")
        const originalUrl = req.originalUrl;
        let keys = req.originalUrl.split('/');
        const requestMethod = req.method;

        let defaultKey = '';
         console.log('key: ', keys);

        switch (requestMethod) {
            case 'POST':
                defaultKey = 'create';
                break;
            case 'GET':
                defaultKey = 'list';
                break;
            case 'PUT':
                defaultKey = 'update';
                break;
            case 'DELETE':
                defaultKey = 'delete';
                break;
        }


        if (requestMethod === 'PUT') {
            // has to have id because it is an edit field. If not id, then it is for sure an invalid request
            console.log('req.body: ', req.body);
            // we will send id for a single record, and ids for multiple record update
            if ((typeof req.body.id === 'undefined' || req.body.id === '' ) && (typeof req.body.ids === 'undefined' || req.body.ids === '')) {
                // invalid request, totally coz we are trying to update 
                throw util.generateWarning('Invalid request. No id was found for an update request.', codes.ID_NOT_FOUND_PUT_REQUEST);
            }
        }

        else if (requestMethod === 'POST' && req.body.id && req.body.id.length > 0) {
            // invalid request, coz we received id for a post request, which is supposed to be a insert request
            throw util.generateWarning('Invalid request. Id cannot be supplied for an insert request.', codes.ID_NOT_FOUND_PUT_REQUEST);
        }

        // means the format is /api/appname/opr/
        keys.push(defaultKey);

        if (keys.length < 5) {
            // wrong url format. No access can be derived
            throw util.generateWarning('Invalid request. The Url is malformed', codes.URL_MALFORMED)
        }

        const appName = keys[2].toLowerCase();

        if (appName === 'tmc') {
                req.app = appName;
                req.appName = appName;
        }
        else {
            // wrong app supplied... ouch
            return responseHelper.invalidApp(res);
        }
       // console.log('req.body appName  ', appName);
        keys = keys.map(key => {
            let k = key;
            if (k.indexOf('?')) {
                // it has a query string. split
                const furtherSplit = k.split('?');
                k = furtherSplit[0];
            }
            return k;
        });

        //console.log('splitting: ', keys);

        let moduleName =  (keys.length === 6 && keys[4] !== '') ? (keys[3].toLowerCase() +'-'+keys[4].toLowerCase()) : keys[3].toLowerCase();
        let requestType = keys[keys.length - 1].toLowerCase();

        //console.log('module 12: ', moduleName);
        //console.log('keys: ', keys);


        let openRoute = false;
        // console.log('new mod: ', moduleName, config.OPEN_MODULES[moduleName]);
        //console.log('req type: ', config.OPEN_MODULES[moduleName] ? config.OPEN_MODULES[moduleName][requestType] : 'no module info');

        switch (originalUrl) {
            case '/profile/save':
                //user can save his own info
                // id of the user has to be the same, 
                // same user id, you are saving your own info. Fine with us :)
                // go ahead with the save
                console.log("2 0 - : ")
                user.saveUser(req, res);

                break;
                default:
                if (typeof config.OPEN_MODULES[moduleName] !== 'undefined') {
                    // found an entry in open modules list
                    // check if all is true or not

                    if (config.OPEN_MODULES[moduleName]['all']
                        || config.OPEN_MODULES[moduleName][requestType]) {
                        // if it is true, then it means it is an open URL, 
                        // if we do get the opr key, then we will actually allow them to go next

                        openRoute = true;

                        if (util.oprMiddleware(req, res)) {
                            // true means we are good to go coz opr key is found
                            console.log('opr key found correctly : ', originalUrl);
                            next(true);
                            return;
                        }
                        else {
                            console.log('super crazy');
                        }
                    }
                }

                 console.log('crazy bhai: ', token );

                // NOTE: if we couldn't find an opr key for open routes, let's not kill them there, the api
                // might have sent us the auth token. So let's continue and try to get the request 
                // like a normal request. However, we only proceed if the auth is not the opr key

                if (token === config.OPR_KEY) {
                    // oopsie.... the opr key is supplied, and we couldn't find info about the module in open routes, 
                    console.log("OPR 1");
                    return responseHelper.unauthorized(res);    
                }
                console.log("2");
                // here onwards, we will assume that we need the Auth token for processing any request.

                // let's try to see if we have got the token in request

                if (!token) {
                     console.log("3");
                    return responseHelper.unauthorized(res);
                }
                console.log("4");
                // let's try to decrypt token
                const decoded = util.tokenIsValid(token);
                
                console.log("5");
                if (decoded.isError) {
                    // error in token
                    console.log("6");
                    throw decoded.error;
                }
                console.log("7");
                if (decoded.userId && decoded.email && decoded.injectedKey) {
                    // valid token
                    console.log("8");
                    // let's make sure the injected key matches
                    if (decoded.injectedKey !== config.INJECTED_KEY) {
                       console.log("9");
                        throw util.generateWarning(`Token corruped`, codes.TOKEN_AUTH_CORRUPTED);
                    }
                     console.log("9");
                    // ok, good token. 

                    // Now we have the user id, let's push it to req so it can be used later on
                    //console.log("ok, good token.");
                    req.user = {
                        id: decoded.userId,
                        email: decoded.email,
                        firstName: decoded.firstName,
                        lastName: decoded.lastName
                    };
                  //  console.log("10");

                    // since the token is valid, so we can just return if the request is an open route request

                    if (openRoute) {
                       // console.log('returning true: ');
                        return next(true);
                    }

                    // let's try if the logged user has access to the module and the requested method

                    //console.log("10");
                    const _user = await user._findUserWithId(decoded.userId);
                   // console.log("11",_user);
                    if (!_user) {
                        console.log("12");
                        // cannot find user. Must have been deleted or a wrong user id. Ouch Ouch Ouch
                        //console.log("11");
                        throw util.generateWarning(`Cannot find the logged in user in database`, codes.ID_NOT_FOUND);
                    }
                    //console.log("12");
                    // check if the user is admin or not
                    if (_user && _user.accessGroup && _user.accessGroup.name === config.SUPER_ADMIN) {
                        // ok, this guy has access to everything. Just send him the access
                      //  console.log("13");
                        return next(true);
                    }

                    // since user is not admin, we will check if the user belongs to a group which has access to this module
                   // console.log("14");
                    if (_user.accessGroup) {
                        // let's find the info
                     //   console.log("15");
                        const _groupAccess = await groupAccess.findGroupAccessToModule(_user.accessGroup.id, moduleName);

                        if (_groupAccess) {
                            // ok, we were able to find the access to the group
                           // console.log("16");
                            // now we need to find if the access satisfies the request as well
                            if (verifyAccess(_groupAccess.access, requestType, requestMethod)) return next(true);
                        }
                    }

                    // if we have come here, it means that we still couldn't find if we have access to that
                   // console.log("17");
                    const _userAccess = await userAccess.findUserAccessToModule(_user.id, moduleName);

                    if (_userAccess) {
                      // console.log("18");
                        const access = verifyAccess(_userAccess.access, requestType, requestMethod);

                        if (access) return next(true);
                    }

                    //console.log('sending from here');

                    // if we have come here, then it means user has no access to the request.
                    responseHelper.unauthorized(res);
                }
                else {
                    //console.log("Invalid token");
                    throw util.generateWarning(`Invalid token`, codes.TOKEN_MISSING_VALUES);
                }
        }
    }
    catch (error) {
        console.log('auth error: ', error);
        responseHelper.error(res, error, error.code ? error.code : codes.ERROR);
    }
};


module.exports.entry = entry;