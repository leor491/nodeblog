'use strict';

var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var moment = require('moment');
var expressValidator = require('express-validator');
//var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

var index = require('./routes/index');
var posts = require('./routes/posts');
var categories = require('./routes/categories');

var app = express();



app.locals.moment = moment;
app.locals.truncateText = function (text, length) {
	var truncatedText = text.substring(0, length) + "...";
	return truncatedText;
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Handle Sessions
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

//legacy express validator. ES6 format
app.use(expressValidator({
	errorFormatter: function (param, msg, value) {
		var namespace = param.split('.'), root = namespace.shift(), formParam = root;

		while (namespace.length) {
			formParam += `[${namespace.shift()}]`; 
		}

		return {
			param:formParam,
			msg,
			value
		};
	}
}));

// Connect-Flash
app.use(require('connect-flash')());
app.use(function(req, res, next){
	res.locals.messages = require('express-messages')(req, res);
	next();
});

// Make our db accessible to our router
app.use(function(req, res, next){
	req.db = db;
	next();
});

app.use('/', index);
app.use('/posts', posts);
app.use('/categories', categories);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
