const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const compression = require('compression');

const util = require('./util/');
const middleware = require('./routes/middleware');
const accountRouter = require('./routes/account');

const masterCategoryRouter = require('./routes/masterCategory');
const masterDetailsRouter = require('./routes/masterDetails');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const otpRouter = require('./routes/otp');
const responseHelper = require('./util/response.helper');

const app = express();

// cors
app.use(cors());
app.options('*', cors());

// compression
app.use(compression({ level: 9 }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));

// max limit 5 mb
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/static', express.static('static'));

//console.log("Auth api request(app.js)")
// routing goes here for the middleware
app.use('/api-auth/*/', (req, res, next) => {
	// send it to middleware
//console.log("Auth api request(app.js - before middleware) req ", req.url, req.headers)
	util.assignHostNameToReq(req);

	middleware.entry(req, res, result => {
		const url = req.originalUrl;
		const keys = url.split('/');
		// let's split
	//	console.log("Auth api request(app.js - start middleware)")
		const splitter = keys[3].split('?');
		//console.log('darn: ', splitter);
		//console.log('darn 2: ', splitter[0]);
		
		if (splitter[0] === 'account' ||
			splitter[0] === 'otp' ||
			splitter[0] === 'user' ||
			splitter[0] === 'admin' ||
			splitter[0] === 'masterCategory' ||
			splitter[0] === 'masterDetails') {
		//	console.log('what an');
			next();
		}
		else {
			//console.log("auth res",res);
			responseHelper.success(res, 200, { result, user: req.user });
		}
	});

});

// rest of the routing goes here, after satisfying the access conditions from middleware
//console.log("routers");
app.use('/api-auth/*/user/', usersRouter);
app.use('/api-auth/*/otp/', otpRouter);
app.use('/api-auth/*/account/', accountRouter); 
app.use('/api-auth/*/masterCategory/', masterCategoryRouter);
app.use('/api-auth/*/masterDetails/', masterDetailsRouter);
app.use('/api-auth/*/admin/', adminRouter);
// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

// error handler
app.use((err, req, res) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

util.initApp();

setInterval(() => {
	const used = process.memoryUsage();
	for (let key in used) {
		console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
	}
	// two minutes memory check
}, 120000);

module.exports = app;
