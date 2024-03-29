
/**
 * Module dependencies.
 */

restclient = {

	init: function() {
		rc = restclient;
		rc.express = require('express');
		rc.restler = require('restler');
		rc.app = rc.express.createServer();

		rc.app.configure(function(){
			rc.app.set('views', __dirname + '/views');
			rc.app.set('view engine', 'jade');
			rc.app.use(rc.express.bodyParser());
			rc.app.use(rc.express.methodOverride());
			rc.app.use(rc.express.static(__dirname + '/public'));
		});
	    rc.app.configure('development', function(){
	      rc.app.use(rc.express.errorHandler({ dumpExceptions: true, showStack: true })); 
	    });
	    
	    rc.app.configure('production', function(){
	      rc.app.use(rc.express.errorHandler()); 
	    });

		rc.app.listen(3000); 
		console.log("Express server listening on port %d in %s mode", rc.app.address().port, rc.app.settings.env);

	    rc.app.post('/', function(req, res) {
	    	var options = {
	    		parser: rc.restler.parsers.json, // TODO XML parser as requested. not particularly urgent.
	    		username: req.body.username, 
	    		password: req.body.password,
	    		headers: { 'Content-Type': req.body.content_type, 'Accept': '*/*' }
			};
			
			if (req.body.uri_method == 'get') {
		    	rc.restler.json(req.body.uri, {}, options).
		    		on('complete', function(data, response) {
    				try {
    					responseText = JSON.stringify(JSON.parse(response.rawEncoded), undefined, 2);
    					statusCode = response.statusCode;
    				}
    				catch (e) {
    					console.log(e);
	    				if (response) {
	    					responseText = response.rawEncoded;
	    					statusCode = response.statusCode;
	    				} else {
	    					responseText = e;
	    					statusCode = 666;
	    				}
    				}		    			
				        res.render('index', {
				          	title: 'Rest Client Post',
				          	content: 'Rest Client Post',
				          	uri: req.body.uri,
				          	content: req.body.content,
				          	header: req.body.header,
				          	response: responseText,
				          	statusCode: statusCode,
				          	username: req.body.username,
				          	password: req.body.password,
				          	uri_method: req.body.uri_method,
				          	content_type: req.body.content_type
				        });
					});
	    	} else if (((req.body.uri_method == 'post') || (req.body.uri_method == 'patch')) && (req.body.content.length > 0)) {
	    		// tunnel PATCH through POST with _method=patch tacked on to URI
	    		var uri = (req.body.uri_method == 'patch') ? req.body.uri + '&_method=patch' : req.body.uri;
	    		if (req.body.content_type == 'application/json') {
		    		try {
		    			options.data = JSON.parse(req.body.content);
		    		} catch (e) {
		    			options.data = {};
		    		}
		    	}
		    	else {
		    		// non JSON input in body
		    		options.data = req.body.content;
		    	}
			    	rc.restler.post(uri, options).
		    		on('complete', function(data, response) {
		    			try {
							responseText = JSON.stringify(JSON.parse(response.rawEncoded), undefined, 2);
							statusCode = response.statusCode;
		    			} catch (e) {
		    				if (response) {
		    					responseText = response.rawEncoded;
		    					statusCode = response.statusCode;
		    				} else {
		    					responseText = e;
		    					statusCode = 666;
		    				}
		    			}
				        res.render('index', {
				          	title: 'Rest Client Post',
				          	uri: req.body.uri,
				          	content: req.body.content,
				          	header: req.body.header,
				          	response: responseText, 
				          	statusCode: statusCode,
				          	username: req.body.username,
				          	password: req.body.password,
				          	uri_method: req.body.uri_method,
				          	content_type: req.body.content_type
				        });
					});
			} else if (req.body.uri_method == 'put' && (req.body.content.length > 0)) {
	    		var parsedInput;

	    		if (req.body.content_type == 'application/json') {
		    		try {
		    			// for some mysterious reasons this data doesn't need to be a JSON object
		    			// but we'll parse anyway so we can have an easy out in case data isn't JSON-format
		    			JSON.parse(req.body.content);
		    			options.data = req.body.content;
		    		}
		    		catch (e)
		    		{
		    			//options.data = '';
		    		}
		    	}
		    	else {
		    		// non JSON body
		    		options.data = req.body.content;
		    	}
		    	rc.restler.put(req.body.uri, options).
	    		on('complete', function(data, response) {
    				var responseText = '';
    				try {
    					responseText = JSON.stringify(JSON.parse(response.rawEncoded), undefined, 2); 
    				}
    				catch (e) {
    					if (response) {
	    					responseText = response.rawEncoded;
	    					statusCode = response.statusCode;
	    				} else {
	    					responseText = e;
	    					statusCode = 666;
	    				}
    				}
			        res.render('index', {
			          	title: 'Rest Client Post',
			          	uri: req.body.uri,
			          	content: req.body.content,
			          	header: req.body.header,
			          	response: responseText, 
			          	statusCode: response.statusCode,
			          	username: req.body.username,
			          	password: req.body.password,
			          	uri_method: req.body.uri_method,
			          	content_type: req.body.content_type
			        });
				});
			} else if (req.body.uri_method == 'delete') {
				rc.restler.del(req.body.uri, options).
				on('complete', function(data, response) {
    				var responseText = '';
    				try {
    					responseText = JSON.stringify(JSON.parse(response.rawEncoded), undefined, 2); 
    				}
    				catch (e) {
    					responseText = response.rawEncoded;
    				}
			        res.render('index', {
			          	title: 'Rest Client Post',
			          	uri: req.body.uri,
			          	content: req.body.content,
			          	header: req.body.header,
			          	response: responseText, 
			          	statusCode: response.statusCode,
			          	username: req.body.username,
			          	password: req.body.password,
			          	uri_method: req.body.uri_method,
			          	content_type: req.body.content_type
			        });
				});
			}
    	});

	    rc.app.get('/', function(req, res) {
	        res.render('index', {
	          	title: 'Rest Client',
	          	content: 'Rest Client',
	          	uri: '',
	          	content: '',
	          	header: {},
	          	response: '',
	          	statusCode: '',
	          	username: '',
	          	password: '',
	          	uri_method: 'get',
	          	content_type: 'application/json'
	        });
	    });
	},

	render: function(content, response) {

	}
}

var rc = restclient;
rc.init();
