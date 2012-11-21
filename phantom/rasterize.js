// Create the page object
var page = require('webpage').create(),

// Load the system and fs libraries
    system = require('system'),
    fs = require('fs'),

// Load MooTools
    moo = require('mootools'),

// Load the validator
    check = require('validator').check;

// Get the settings and prepare the export
var args = (system.args[1]) ? JSON.parse(system.args[1]) : {};

// Load the defaults from config
var defaults = {
    input: null,
    output: {
        format: 'png',
        screen: { width: 960, height: 640 },
        paper: { format: 'letter', orientation: 'portrait', border: '0.75in' },
        zoom: 1,
    },
    settings: {
        javascript: true,
        images: true,
    },
};

// Merge the args and the defaults
var params = Object.merge(defaults, args);

var render = function(params, page) {
   
    // Load crypto tools
    var md5 = require('MD5');
    
    // Save the output file 
    var file = '/tmp/' +  md5(JSON.stringify(params)) + '.' + params.output.format;
                    
    // Save the file
    page.render(file);
                
    // Output the file
    fs.write('/dev/stdout', JSON.stringify( { format: params.output.format, location: file } ), 'w');  
    
    // Return the page
    return page;
}

// Check for the right format
if (['png', 'jpg', 'gif', 'pdf'].indexOf(params.output.format) === -1) {
    params.output.format = defaults.output.format;
}

// Check if this is a pdf request
if (params.output.format === 'pdf') {
    
    // Set the paper size
    page.paperSize = {
        format: params.output.paper.format,
        orientation: params.output.paper.orientation,
        border: params.output.paper.border,
    };

// This is an image
} else {
    
    // Set the viewport size
    page.viewportSize = {
        width: params.output.screen.width,
        height: params.output.screen.height,
    };
}

// Add a zoom factor
page.zoomFactor = params.output.zoom;

// Add the settings
page.settings = {
    javascriptEnabled: params.settings.javascript,
    loadImages: params.settings.images,
};

// Check in we need to convert an URL or actual content
if (check(params.input).isUrl()) {
    
    // Render the remote page
    page.open(params.input, function (status) {

        // Check if we could open the file
        if (status === 'success') {

            window.setTimeout(function () {
            
                // Render the page
                page = render(params, page);
                
                // Exit phantom
                phantom.exit();
            
            }, 200);
        }
    });
    
} else {
    // Load the content into the page
    page.content = params.input;
    
    // Render the page
    page = render(params, page);
    
    // Exit phantom
    phantom.exit();
}