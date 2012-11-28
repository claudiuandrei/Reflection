/*
 * GET home page.
 */
 
 // Load file system
var fs = require('fs'),

// Load the Markdown parser
    marked = require('marked');

exports.index = function(req, res) {
    
    // Load the README.md file
    var readme = fs.readFileSync('README.md', 'utf8');
    
    res.render('docs', { content: marked(readme) });
};