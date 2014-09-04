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

	var sendRequest = function sendRequest(settings){
		var postData = JSON.stringify(settings.postData),
			options = settings.remoteServer,
			req = {};
			
		if(settings.isHttps){
			options.rejectUnauthorized = false;
		}
		
		req = clientRequest.request(options, function(res){
			res.setEncoding('utf8');
			res.on('data', function(chunk){
				console.log('Response: ' + chunk);
				if(typeof settings.callback === 'function'){
					settings.callback();
				}
			});
		});
		req.write(postData);
		req.end();
		req.on('error', function(e){
			console.log('Got error: ' + e.message);
		});
	};
	
	var sleepTime = function(milliseconds){
		var start = +new Date;
			
		while(+new Date - start <= milliseconds){
			;
		}
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
		files = this.filesSrc,
		isAuto = grunt.option('auto') || false,
		done = this.async(),
		delayTime = options.delayTime || 250,
		isHttps = true;
	
	if (options.remoteServer.protocol !== 'http' && options.remoteServer.protocol !== 'https') {
      grunt.fatal('protocol option must be \'http\' or \'https\'');
    }
	
	isHttps = options.remoteServer.protocol === 'https' ? true : false;
	clientRequest = require(isHttps ? 'https' : 'http');
	delete options.remoteServer.protocol;
	grunt.log.writeln("======changedFiles=====: ", files);
	
	async.each(files, function(file, callback){
		//console.log("file: ", file);
		var content = grunt.file.read(file),
			settings = {
				isHttps: isHttps,
				remoteServer: options.remoteServer,
				callback: function(){
					callback();
				}
			};
		
		if(typeof options.enhanceData === 'function'){
			settings.postData = options.enhanceData(options.postData, file, content);
		}
		sleepTime(delayTime);
		sendRequest(settings);
		
	}, function(err){
		if(err){
			console.log('ERROR: an error occurred - ' + err.message);
		}
		else{
			console.log('SUCCESS: async run successfully!');
			done();
		}
	});
	if(isAuto){
		initAutoDeploy(grunt);
		grunt.task.run('watch:cmsdeploy');
	}
  });

};
