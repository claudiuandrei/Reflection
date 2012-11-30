
/*
 * GET api pages.
 */

// Load dependencies
var mootools = require('mootools'),

// Load file system
    fs = require('fs'),

// This is how phantom is loaded
    spawn = require('child_process').spawn,
    
// Load the events
    events = require('events'),
    
// Load the configuration file
    config = JSON.parse(fs.readFileSync('config/export.json', 'utf8')),

// Load the database
    mongo = require('mongoose'),

// Create the database connection
    db = mongo.createConnection(config.db.connection, config.db.options),
    
// Create a database model
    resources = db.model('Resources', new mongo.Schema({ format: String, output: String }, config.db.schema));
    
// Create a queue
var queue = 0;

// Load the event emitter
var thread = new events.EventEmitter;

// Add multiple listeneres
thread.setMaxListeners(200);

// Do this instead of actually accessing the post thing
exports.queue = function(req, res) {
    
    // Check if we need to start a process right away
    if (queue < config.threads) {
        
        // Add the req to the thread
        queue++;
      
        // Run the post request
        return exports.post(req, res);
    
    }
    
    // Return the result on ready
    thread.once('ready', function() {
        return exports.queue(req, res);
    });
};

// Eport an error page
exports.error = function(err, res) {
    
    // Set the page status code
    res.status(404);
    
    // Return the actual content
    res.render('404', { title: err });
};

// Export the output
exports.output = function(req, res) {

    // Add the location
    req.data.location = req.protocol + '://' + req.headers.host + '/' + config.routes.base + '/' + req.data._id + '.' + req.data.format;
    
    // Check if we can render the format
    if (['json', req.data.format].indexOf(req.params.format) === -1) {
        
        // Return a 404
        return exports.error(config.errors.request, res);
    }
    
    // Create the output
    switch (req.params.format) {
        case 'json':
            
            // Remove the version number
            delete req.data.__v;
            
            // Check if we need to include the content in the JSON response
            if (!req.query.include_content) {
                delete req.data.output;
            }

            // Return the output data with the proper headers
            res.contentType('application/json');
            
            // Return the output data with the proper headers
            res.send(JSON.stringify(req.data));
            
            break;
        
        case 'png':
        case 'jpg':
        case 'gif':
        
            // Return the output data with the proper headers
            res.contentType('image/' + req.data.format);
            
            // Return the output data with the proper headers
            res.send(new Buffer(req.data.output, 'base64'));
           
            break;
    }
}

// GET /export/:id.:format
exports.get = function(req, res) {

    // Load the output from mongo based on id
    resources.findById(req.params.id, function(err, data) {
        
        // Return a 404
        if (err) {
            return res = exports.error(err, res);
        }
        
        // The id it is not in the database
        if (!data) {
            return res = exports.error(config.errors.request, res);
        }
        
        // Load the in the request
        req.data = JSON.parse(JSON.stringify(data));
        
        // Return the output
        return exports.output(req, res);
    });
};

// POST /export
exports.post = function(req, res) {

    // Read data from the JSON request
    var rasterize = req.body;
    
    // Create the image
    var phantom  = spawn('phantomjs', ['phantom/rasterize.js', JSON.stringify(rasterize) ]);
    
    // The tread ended
    phantom.on('exit', function() {
        
        // We have a free thread
        queue--;
        
        // Let the listners know they can pus a new post request
        thread.emit('ready');
    });

    // Export the results to a JSON response
    phantom.stdout.on('data', function (data) {
        
        // Load and parse the data
        data = JSON.parse(data);
            
        // Get the data from the files
        data.output = fs.readFileSync(data.location, 'base64');
            
        // Delete the image from the server
        fs.unlinkSync(data.location);
           
        // Save the image
        resources.create({format: data.format, output: data.output }, function (err, output) {
                
            // Check for errors
            if (err) {
                return exports.error(err, res);
            }
            
            // Load the in the request
            req.data = JSON.parse(JSON.stringify(output));
                        
            // Set the output format, always use JSON for POST
            req.params.format = 'json';
                        
            // Output the data
            return exports.output(req, res);
        });
    });
};