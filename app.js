var express = require('express');
var index = require('./routes/index');
var user = require('./routes/user');
var shop = require('./routes/shop');
var stock = require('./routes/stock');
var pp = require('./routes/paypal');
var admin = require('./routes/admin');
var stats = require('./routes/stats');
var checkout = require('./routes/checkout');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var not_secure_key = "NOTSECUREKEYOMFGCHANGETHATFORLOVEOFGOD_go to the instalinstruction.txt";
process.env.cookieKey = ( process.env.cookieKey == null || process.env.cookieKey == undefined) ? process.env.cookieKey : not_secure_key;
if( process.env.cookieKey == not_secure_key)
    console.log("!!!NOTSECURED_PASSWORD_encryption!!!\n");
app.use(session({
  cookieName: 'session',
  secret: process.env.cookieKey,
  duration: 24 * 60 * 60 * 1000,
  activeDuration: 30 * 60 * 1000,
}));

app.use('/', index);
app.use('/user', user);
app.use('/shop', shop);
app.use('/checkout', checkout);
app.use('/stock', stock);
app.use('/paypal', pp);
app.use('/admin', admin);
app.use('/stats', stats);

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
