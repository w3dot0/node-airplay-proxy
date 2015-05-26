var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var router = express.Router();
app.use('/', router);


/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title: 'error'
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    title: 'error'
  });
});

app.listen(7000);
console.log('listening on port 7000');

var airplay = require('airplay');
var browser = airplay.createBrowser();
browser.start();

/* GET home page. */

router.get('/', function (req, res) {
  res.render('index', {
    title: 'Work in progress'
  });
});

router.get('/devices', function (req, res) {
  res.send(getDevices().map(render));
});

var staticDevices = [];

function getDevices() {
  return browser.getDevices().concat(staticDevices);
}

function findByMacAddress(address) {
  var devices = getDevices();
  return devices.filter(function (device) {
    return device.info_.txtRecord.deviceid === address;
  })[0];
}

function render(device) {
  if (!device) {
    return null;
  }
  console.log(device);
  var info = device.info_;
  var details = device.serverInfo_ || info.txtRecord;
  return {
    name: info.name,
    host: info.host,
    port: info.port,
    deviceid: details.deviceid,
    model: details.model,
    addresses: info.addresses
  }
}

router.get('/devices/:macaddress', function (req, res) {
  var address = String(req.params.macaddress);
  var device = findByMacAddress(address);
  if (device) {
    res.send(render(device));
  } else {
    res.status(404).end('not found');
  }
});

router.get('/devices/:macaddress/status', function (req, res) {
  var address = String(req.params.macaddress);
  var device = findByMacAddress(address);
  if (device) {
    device.status(function (status) {
      res.send(status);
    });
  } else {
    res.status(404).end('not found');
  }
});

var dns = require('dns');

router.post('/devices', function (req, res) {
  if (req.body.host && req.body.port) {
    var info = {
      host: req.body.host,
      port: req.body.port || 7000
    };

    dns.lookup(info.host, function (err, addresses) {
      if (err) {
        return res.status(500).send(err);
      }
      info.addresses = [addresses];
      var device = new airplay.Device("static", info, function (device) {
        staticDevices.push(device);
        res.send(render(device));
      });
    });
  } else {
    res.status(422).send('required param missing: {host: "", port: 7000}');
  }
});

module.exports = app;
