var path = require('path'),
    http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    route = require('./lib/actions');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.locals.pretty = true;
route(app);

app.listen(8080);

console.log('Express running');