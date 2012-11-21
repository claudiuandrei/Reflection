/*
 * GET home page.
 */

exports.error = function(req, res){
    // Set the page status code
    res.status(404);
    
    // Return the actual content
    res.render('index', { title: 'Express' });
};