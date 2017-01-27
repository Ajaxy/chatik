var path = require('path'),
    http = require('http'),
    express = require('express'),
    route = require('./lib/actions');

// Protect chatik by changing the home URL from "/" to "/{SECRET}".
var SECRET = '';

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('secret', SECRET)
app.use(express.static(path.join(__dirname, 'public')));
app.locals.pretty = true;
route(app);

app.listen(8080);

console.log('Express running');