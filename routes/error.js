/*
 * GET home page.
 */
 
 exports.index = function(req, res){
  res.render('404', { title: 'Page not found' });
};