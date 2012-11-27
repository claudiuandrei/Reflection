
/**
 * Module dependencies.
 */

// Load dependencies
var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),

    // Routes
    docs = require('./routes/docs'),
    error = require('./routes/error'),
    api = require('./routes/export');

// Create the app
var app = express();

// Load the static files separatley
app.use(express.static(__dirname + '/public'));

// Load the configuration file
var config = JSON.parse(fs.readFileSync('config/export.json', 'utf8'));

// Configure the app
app.configure(function() {
    app.set('port', process.env.PORT || 3001);
    app.set('host', process.env.HOST || 'localhost');
    
    app.set('views', __dirname + '/views');
    app.set('view engine', 'hjs');
    
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    
    app.use(require('less-middleware')({ src: __dirname + '/public' }));
    app.use(express.static(path.join(__dirname, 'public')));
});

// Add the error handler if we are on development environment
app.configure('development', function() {
    app.use(express.errorHandler());
});

// Load the data for the routes
app.get('/' + config.routes.base + '/:id.:format', api.get);
app.post('/' + config.routes.base, api.post);

// Show the documentation in the index page
app.get('/', docs.index);

// Catch all other routes and throw a 404 error
app.get('*', error.index);

// Start the server
http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
