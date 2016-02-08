var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var routes = require('./routes/index');
// var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('mysecret'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('express-session')({secret:'keyboard cat',resave:false,saveUninitialized:true}));
//Initialize passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());


app.use(function(req,res,next){
  req.models = app.models;
  req.connections = app.connections;
  next();
});


app.use('/', routes);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var models = require('./models');

models.waterline.initialize(models.config, function(err, models) {
  if (err) throw err;
  //console.log(models.collections);
  //console.log('Successully loaded models');
  app.models = models.collections;
  app.connections = models.connections;
});


module.exports = app;
