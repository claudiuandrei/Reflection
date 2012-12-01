// Create the page object
var page = require('webpage').create(),

// Load the system and fs libraries
    system = require('system'),
    fs = require('fs'),

// Load mootools for object and class representation
    mootools = require('mootools');
    
// Create a new class for rasterizing the url/content
var Rasterize = new Class({
    
    // Load the defaults from config
    defaults: {
        input: null,
        output_format: 'png',
        output_screen_width: 960,
        output_screen_height: 640,
        output_screen_zoom: 1,
        settings_javascript_enabled: true,
        settings_load_images: true,
    },
    
    initialize: function(args) {
        
        // Initialize the page object
        this.page = require('webpage').create();
        
        // Get the final params by merging the received args and the defaults
        this.params = Object.merge(this.defaults, args);
        
        // Check for the right format
        if (['png', 'jpg', 'gif'].indexOf(this.params.output_format) === -1) {
            this.params.output_format = this.defaults.output_format;
        }
    
        // Set the viewport size
        this.page.viewportSize = {
            width: this.params.output_screen_width,
            height: this.params.output_screen_height,
        };

        // Add a zoom factor
        this.page.zoomFactor = this.params.output_zoom;

        // Add the settings
        this.page.settings = {
            javascriptEnabled: this.params.settings_javascript_enabled,
            loadImages: this.params.settings_load_images,
        };
    },
    
    // Render the page on the server
    render: function() {
   
        // Create a random number
        var string = Math.floor(Math.random() * Math.pow(2, 128)).toString(36).substring(16);
        
        // Save the output file 
        var file = '/tmp/' +  string + '.' + this.params.output_format;
                        
        // Save the file
        this.page.render(file);
                    
        // Output the response
        fs.write('/dev/stdout', JSON.stringify( { status: 'success', format: this.params.output_format, location: file } ), 'w');
        
        // Exit phantom after rendering
        phantom.exit();
    },

    // Controller, exports the page to a image
    export: function() {
    
        // Test if this is a url
        var pattern = new RegExp(/(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi);
    
        // This is an external URL
        if (pattern.test(this.params.input)) {
        
            // Render the remote page
            this.page.open(this.params.input, function(status) {
                 
                // Check if we could open the remote page
                if (status === 'success') {     
                    this.render.delay(200, this);
                
                // Throw an error here
                } else {
                    fs.write('/dev/stdout', JSON.stringify( { status: status } ), 'w');
                }
            }.bind(this));
        
        // This is HTML content
        } else {
            
            // Load the content into the page
            this.page.content = this.params.input;
    
            // Render the page
            this.render();
        }
    },
});

// Load the arguments
var args = (system.args[1]) ? JSON.parse(system.args[1]) : {};

// Get the settings and prepare the export
var image = new Rasterize(args);

// Export
image.export();