require('dotenv').config()

var express = require('express'),
    steam   = require('./index'),
    parseArgs = require('minimist'),
    chalk = require('chalk')

var args = parseArgs(process.argv.slice(2))
var app = express();

var config = {
  apiKey: args.apiKey || process.env.STEAM_API_KEY,
  host: args.authHost || process.env.AUTH_HOST,
  returnUrl: args.returnUrl || process.env.RETURN_URL,
  secret: args.sessionSecret || process.env.SESSION_SECRET
}

console.log(chalk.green('Starting Steam Auth Server'));
console.log(chalk.yellow(`Config: ${JSON.stringify(config, null, 2)}`))

var port = config.host.substr(config.host.lastIndexOf(':') + 1);

app.use(require('express-session')({ resave: false, saveUninitialized: false, secret: config.secret }));
app.use(steam.middleware({
  realm: config.host,
  verify: `${config.host}/verify`,
  apiKey: config.apiKey
}));

app.get('/', function(req, res) {
  res.send(req.user == null ? 'not logged in' : 'hello ' + req.user.username).end();
});

app.get('/authenticate', steam.authenticate(), function(req, res) {
  res.redirect('/');
});

app.get('/verify', steam.verify(), function(req, res) {
  res.redirect(`${config.returnUrl}?user=${JSON.stringify(req.user)}`)
});

app.get('/logout', steam.enforceLogin('/'), function(req, res) {
  req.logout();
  res.redirect('/');
});

app.listen(port);
console.log(chalk.green(`Listening at ${config.host}`));
