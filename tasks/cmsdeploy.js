/*
 * grunt-cmsdeploy
 * https://github.com/yongbchen/cmsdeploy
 *
 * Copyright (c) 2014 yongbchen
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

	var async = require('async'),
		clientRequest = {};

	var errorHandler = function errorHandler(err){
		// a placeHolder error handler function
		console.log(err.message);
	};

	var initAutoDeploy = function initAutoDeploy(grunt){
		// For the saving multiple files simultaneously
		var changedFiles = Object.create(null);
		var onChange = grunt.util._.debounce(function() {
			grunt.config('cmsdeploy.app.src', Object.keys(changedFiles));
			changedFiles = Object.create(null);
		}, 200);
		grunt.event.on('watch', function(action, filepath) {
			changedFiles[filepath] = action;
			onChange();
		});
	};

  grunt.registerMultiTask('cmsdeploy', 'Node.js Grunt plugin. Deploy file content to a remote server', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
			remoteServer: {
				protocol: 'https',
				hostname: "localhost", 
				port: 443,
				path: "/",
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				}
			},
			delayTime: 250,
			postData: {
				
			},
			enhanceData: function(data, file, content){
				return data;
			}
		}),
		postData = options.postData,
		files = this.filesSrc,
		totalRequest = files.length,
		idx = 0,
		file = {},
		content = '',
		httpRequestOptions = {},
		req = {},
		isAuto = grunt.option('auto') || false,
		done = this.async(),
		delayTime = options.delayTime,
		isHttps = true;
	
	if (options.remoteServer.protocol !== 'http' && options.remoteServer.protocol !== 'https') {
      grunt.fatal('protocol option must be \'http\' or \'https\'');
    }
	
	isHttps = options.remoteServer.protocol === 'https' ? true : false;
	if(isHttps){
		options.remoteServer.rejectUnauthorized = false;
	}
	clientRequest = require(isHttps ? 'https' : 'http');
	delete options.remoteServer.protocol;
	
	grunt.log.writeln("======changedFiles=====: ", files);
	
	httpRequestOptions = options.remoteServer;
	
	//Send the http(s) request
	sendRequest(idx);
		
	function sendRequest(idx){
		
		if(idx > totalRequest - 1){
			done();
			return;
		}
		//Set the data that will be posted to the iCMS remote server
		file = files[idx];
		content = grunt.file.read(file);
		postData = typeof options.enhanceData === 'function' ? options.enhanceData(options.postData, file, content) : '',
		postData = JSON.stringify(postData);
		
		req = clientRequest.request(httpRequestOptions, function(res){
			res.setEncoding('utf8');
			res.on('data', function(chunk){
				console.log('Response: ' + chunk);
			});
			res.on('end', function(){
				//sleepTime(delayTime);
				
				setTimeout(function(){
					idx++;
					sendRequest(idx);
				}, delayTime);
			});
		});
		req.write(postData);
		req.on('error', function(e){
			console.log('Got error: ' + e.message);
		});
		req.end();
	};
	
	function sleepTime(milliseconds){
		var start = +new Date;
			
		while(+new Date - start <= milliseconds){
			;
		}
	};
	
	if(isAuto){
		initAutoDeploy(grunt);
		grunt.task.run('watch:cmsdeploy');
	}
  });

};
