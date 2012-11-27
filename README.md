# Reflection
Screenshot taking API built on top of Node(+ Express) Phantom and Mongo (+ Mongoose).

## Dependencies

To run Reflection besides __[Node.js](http://nodejs.org/)__, __[PhantomJS](http://phantomjs.org)__ and __[MongoDB](http://www.mongodb.org)__, you need the following Node.js dependencies: _[Express](http://expressjs.com)_, _[Mongoose](http://mongoosejs.com)_, _[MooTools](http://mootools.net)_, _[Hogan](http://twitter.github.com/hogan.js)_, _[LESS](http://lesscss.org)_ and _[MD5](https://github.com/pvorb/node-md5)_.

To install the main dependencies for Mountain Lion, follow the [Development Setup](https://github.com/DelphiSolutions/Delphi/wiki/Development-Setup-for-Mac-Mountain-Lion), after that, intall the node dependencies by typing <code>$ sudo npm install</code> in the aplication directory.

## Usage

#### <code>GET /export/:id.:format</code>

Get the saved screenshot data based on an id. You can get either the image directly or a JSON representation for it.

* <code>http://localhost:3001/export/50b52cb7b002c2f352000001.png</code>
* <code>http://localhost:3001/export/50b52cb7b002c2f352000001.json</code>

##### Parameters

* __include_content__ _(optional)_
	
	When set to either true or 1, the JSON response will not contain the base64 image data. Omit this parameter to receive the complete data. 	_(This parameter only affects the JSON response)_

##### Output

	{
    	"_id": "50b52cb7b002c2f352000001",
    	"format": "png",
    	"output": "base64EncodedImageData",
    	"location": "http://localhost:3001/export/50b52cb7b002c2f352000001.png"
	}

#### <code>POST /export</code>

Create a new screenshot and save it into the database for later use. The request will return the same json response as a <code>GET /export/_new_resource_id.json</code>.

The __include_content__ parameter can be used on the POST request as a query parameter to get the image data in the response. 

##### Format

The request parameters need to be in the body and they can be either form-encoded or json:

* __input__ _(defaults to **null**)_

	Contains either a url of the page to capure, or the html content to render. 

* __ouput_format__ _(defaults to **png**)_
	
	The output image format, supports __png__, __jpg__ and __gif__.

* __output_screen_width__ _(defaults to **960**)_

	The width of the browser screen when rendering the webpage.
	
* __output_screen_height__ _(defaults to **640**)_

	The height of the browser screen when renedring the webpage. The screenshot can have a bigger height if there is content beyond the screen size.
	
* __output_zoom__ _(defaults to **1**)_

	Zoom factor for the page.

* __settings_javascript_enabled__ _(defaults to **true**)_

	Enable javascript when rendering the webpage.
	
* __settings_load_images__ _(defaults to **true**)_

	Enable image loading when rendering the webpage.
	
##### Defaults

	{
    	"input": null,
    	"output_format": "png",
    	"output_screen_width": 960,
    	"output_screen_height": 640,
    	"output_screen_zoom": 1,
    	"settings_javascript_enabled": true,
    	"settings_load_images": true
	}

##### Example

For example a request to take __jpg__ screenshot of the __[http://delphi.us](http://delphi.us)__ page rendered on a __960 x 640 px__ screen will have the following post body:

* <code>input=input=http%3A%2F%2Fdelphi.us&output_format=jpg&output_screen_width=1200&output_screen_height=800</code>

## Author
Author(s): Claudiu Andrei

#### (C) Copyright 2012, [Delphi Solutions](http://delphi.us)