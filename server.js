console.log('args', process.argv)

var express = require('express'),
    steam   = require('./index');

var app = express();
var apiKey = process.argv[3];
var host = process.argv[4];
var returnUrl = process.argv[5];
var secret = process.argv[6];

var port = host.substr(host.lastIndexOf(':') + 1);

app.use(require('express-session')({ resave: false, saveUninitialized: false, secret }));
app.use(steam.middleware({
  realm: host, 
  verify: `${host}/verify`,
  apiKey: apiKey
}));

app.get('/', function(req, res) {
  res.send(req.user == null ? 'not logged in' : 'hello ' + req.user.username).end();
});

app.get('/authenticate', steam.authenticate(), function(req, res) {
  res.redirect('/');
});

app.get('/verify', steam.verify(), function(req, res) {
  res.redirect(`${returnUrl}?user=${JSON.stringify(req.user)}`)
});

app.get('/logout', steam.enforceLogin('/'), function(req, res) {
  req.logout();
  res.redirect('/');
});

app.listen(port);
console.log(`Listening at ${host}`, port);
