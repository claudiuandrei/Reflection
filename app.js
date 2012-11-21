
/**
 * Module dependencies.
 */

// Load dependencies
var express = require('express'),
    http = require('http'),
    path = require('path'),

    // Routes
    docs = require('./routes/docs')
    api = require('./routes/export');

// Create the app
var app = express();

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
app.get('/export/:id.:format', api.get);
app.get('/export', api.post);
app.get('/', docs.index);

// Start the server
http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
