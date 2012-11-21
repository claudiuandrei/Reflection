
/*
 * GET home page.
 */

// Load dependencies
var mootools = require('mootools'),

// Load file system
    fs = require('fs');
    
var spawn = require('child_process').spawn;

// Load the database
// Todo: Load this from a configuration file
var mongo = require('mongoose'),

    // Create the database connection
    db = mongo.createConnection('localhost', 'test'),
    
    // Create a database model
    resources = db.model('Resources', new mongo.Schema({ format: String, output: String }));

exports.error = function(err, res){
    // Set the page status code
    res.status(404);
    
    // Return the actual content
    res.render('index', { title: err });
};

exports.output = function(req, res) {

    // Add the location
    // Use this from config file
    req.data.location = req.protocol + '://' + req.headers.host + '/export/' + req.data._id + '.' + req.data.format;
    
    // Set up the default output
    var output = req.data.output;
    
    // Set the default content type prefix
    var prefix = 'image';
    
    // Default files are encoded
    var encoding = true;
    
    // Check if we can render the format
    if (['json', req.data.format].indexOf(req.params.format) === -1) {
        
        // Return a 404
        return res = exports.error('Unsupported format', res);
    }
    
    // Create the output
    switch (req.params.format) {
        case 'json':
            
            // Set the output as a JSON string
            output = JSON.stringify(req.data);
            
            // JSON files are not encoded
            encoding = false;
            
        case 'pdf':
            
            // Set the application prefix
            prefix = 'application';
        
        case 'png':
        case 'jpg':
        case 'gif':
        
            // Return the output data with the proper headers
            res.contentType(prefix + '/' + req.params.format);
            
            // Return the output data with the proper headers
            res.send((encoding === true) ? new Buffer(output, 'base64') : output);
           
            break;
        
        default:
            return res = exports.error(req.data._id, res);
    }
    
    // Return the response object
    return res;
}

// GET /export/:id.:format
exports.get = function(req, res) {

    // Load the output from mongo based on id
    resources.findById(req.params.id, function(err, data) {
        
        // Return a 404
        if (err) {
            return res = exports.error(err, res);
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
    // var rasterize = req.body;

    // Set up the settings 
    var rasterize = {
        input: 'http://apple.com',
        output: {
            format: 'png',
            screen: { width: 800, height: 600 },
        },
    };

    // Create the image
    var phantom  = spawn('phantomjs', ['phantom/rasterize.js', JSON.stringify(rasterize) ]);

    // Export the results to a JSON response
    phantom.stdout.on('data', function (data) {
        
        // Load and parse the data
        data = JSON.parse(data);
        
        // Get the data from the files
        data.output = fs.readFileSync(data.location, 'base64');
       
        // Save the image
        resources.create({format: data.format, output: data.output }, function (err, output) {
            
            // Check for errors
            if (err) {
                return exports.error('Save error', res);
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