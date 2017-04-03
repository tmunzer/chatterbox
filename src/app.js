const path = require('path');

const express = require('express');
const morgan = require('morgan')
const parseurl = require('parseurl');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const favicon = require('serve-favicon');


const app = express();
app.use(morgan('\x1b[32minfo\x1b[0m: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]', {
  skip: function (req, res) { return res.statusCode < 400 && req.url != "/" && req.originalUrl.indexOf("/api") < 0 }
}));

//===============MONGODB=================
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const mongoConfig = require('./config').mongoConfig;
global.db = mongoose.connection;

db.on('error', console.error.bind(console, '\x1b[31mERROR\x1b[0m: unable to connect to mongoDB on ' + mongoConfig.host + ' server'));
db.once('open', function () {
  console.info("\x1b[32minfo\x1b[0m:", "Connected to mongoDB on " + mongoConfig.host + " server");
  const refreshAcsToken = require("./bin/refreshAcsToken").auto();
  const refreshSparkToken = require("./bin/refreshSparkToken").auto();
  const monitor = require("./bin/monitor");
  monitor.devices();
});

mongoose.connect('mongodb://' + mongoConfig.host + '/' + mongoConfig.base);



// Use express-session middleware for express
app.use(session({
  secret: 'dsHhCAyYdqYAu25Km5EtkLMZm7XD',
  resave: true,
  store: new MongoDBStore({
    uri: 'mongodb://' + mongoConfig.host + '/express-session',
    collection: 'chatterbox'
  }),
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 60 * 1000 // 30 minutes
  }
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static('../bower_components'));

const slack = require('./routes/slack');
app.use('/slack/', slack);

const spark = require('./routes/spark');
app.use('/spark/', spark);

const oauth = require('./routes/oauth');
app.use('/oauth/', oauth);

const api = require('./routes/api');
app.use('/api', api);

const login = require('./routes/login');
app.use('/', login);

//Otherwise
app.get("*", function (req, res) {
  res.redirect("/web-app/");
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  if (err.status == 404) err.message = "The requested url " + req.originalUrl + " was not found on this server.";
  res.status(err.status || 500);
  res.render('error', {
    status: err.status,
    message: err.message,
    error: {}
  });
});


module.exports = app;
