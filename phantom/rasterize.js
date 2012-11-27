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
        output: {
            format: 'png',
            screen: { width: 960, height: 640 },
            zoom: 1,
        },
        settings: {
            javascript: true,
            images: true,
        },
    },
    
    initialize: function(args) {
        
        // Initialize the page object
        this.page = require('webpage').create();
        
        // Get the final params by merging the received args and the defaults
        this.params = Object.merge(this.defaults, args);
        
        // Check for the right format
        if (['png', 'jpg', 'gif'].indexOf(this.params.output.format) === -1) {
            this.params.output.format = this.defaults.output.format;
        }
    
        // Set the viewport size
        this.page.viewportSize = {
            width: this.params.output.screen.width,
            height: this.params.output.screen.height,
        };

        // Add a zoom factor
        this.page.zoomFactor = this.params.output.zoom;

        // Add the settings
        this.page.settings = {
            javascriptEnabled: this.params.settings.javascript,
            loadImages: this.params.settings.images,
        };
    },
    
    // Render the page on the server
    render: function() {
   
        // Load crypto tools
        var md5 = require('MD5');
        
        // Save the output file 
        var file = '/tmp/' +  md5(JSON.stringify(this.params)) + '.' + this.params.output.format;
                        
        // Save the file
        this.page.render(file);
                    
        // Output the response
        fs.write('/dev/stdout', JSON.stringify( { format: this.params.output.format, location: file } ), 'w');
        
        // Exit phantom after rendering
        phantom.exit();
    },

    export: function() {
    
        // Test if this is a url
        var pattern = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");
    
        // This is an external URL
        if (pattern.test(this.params.input)) {
    
            // Render the remote page
            this.page.open(this.params.input, function(status) {
                 
                // Check if we could open the remote page
                if (status === 'success') {     
                    this.render.delay(2000, this);
                }
                
                // Throw an error here
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
    
// Get the settings and prepare the export
var image = new Rasterize((system.args[1]) ? JSON.parse(system.args[1]) : {});

// Export
image.export();