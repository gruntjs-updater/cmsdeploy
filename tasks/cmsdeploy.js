/*
 * grunt-cmsdeploy
 * https://github.com/yongbchen/cmsdeploy
 *
 * Copyright (c) 2014 yongbchen
 * Licensed under the MIT license.
 */

'use strict';
    
module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('cmsdeploy', ('Node.js Grunt plugin.').red + ('\nDeploy file content to a remote server').yellow, function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({    
            delayTime: 0,
            batchFilesNum: 500
        }),
        delayTime = options.delayTime,
        batchFilesNum = options.batchFilesNum,
        files = this.filesSrc,
        isAuto = grunt.option('auto'),
        done = this.async(),
        isHttps = options.remoteServer.protocol === 'https' ? true : false,
        async = require('async'),
        _ = require('underscore'),
        util = {},
        clientRequest = require(isHttps ? 'https' : 'http');

    delete options.remoteServer.protocol;
    
    if(isHttps){
        options.remoteServer.rejectUnauthorized = false;
    }

    grunt.verbose.writeln("======changedFiles=====: ", files);

    util = {
        filesList: [],

        getFilesList: function (){
            return this.filesList;
        },

        setFilesList: function (list){
            this.filesList = list;
        },

        errorHandler: function (err){
            // a placeHolder error handler function
            console.log(err.message);
        },

        initAutoDeploy: function (){
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
        },

        sleep: function(millsec){
            var now = +new Date;
            while(+new Date - now < millsec){
                ;
            }
        },

        splitList: function(files, count){

            return _.values(_.groupBy(files, function(file, idx){
                return Math.floor(idx/count);
            }));
        },

        sendRequest: function (settings){
            var postData = JSON.stringify(settings.postData),
                options = settings.remoteServer,
                req = clientRequest.request(options, function(res){
                    
                    if(typeof settings.callback === 'function'){
                        settings.callback();
                    }

                    res.setEncoding('utf8');
                    res.on('data', function(chunk){
                        console.log('Response: ' + chunk);
                    });
                });

            req.write(postData);
            req.end();
            req.on('error', function(e){
                console.log('Got error: ' + e.message);
            });
        },

        start: function (options){
            var filesList = this.getFilesList(),
                _this = this;

            async.eachSeries(filesList, function(files, callbackDone){

                async.each(files, function(file, callback){
                    //console.log("file: ", file);
                    var content = grunt.file.read(file),
                        settings = {
                            remoteServer: options.remoteServer,
                            callback: function(){
                                callback();
                            }
                        };
                    
                    if(typeof options.enhanceData === 'function'){
                        settings.postData = options.enhanceData(options.postData, file, content);
                    }

                    _this.sendRequest(settings);
                    
                }, function(err){
                    if(err){
                        grunt.fail.fatal('ERROR: an error occurred - ' + err.message);
                    }
                    else{
                        console.log('SUCCESS: async run successfully!');
                        callbackDone();
                        _this.sleep(options.delayTime);
                    }
                });

            }, function(err){
                if(err){
                    grunt.fail.fatal('ERROR: an error occurred - ' + err.message);
                }
                else{
                    console.log('SUCCESS: async run successfully!');
                    done();
                }
            });
            
            if(isAuto){
                this.initAutoDeploy();
                grunt.task.run('watch:cmsdeploy');
            }
        },

        init: function(options){
            var files = options.files,
                batchFilesNum = options.batchFilesNum,
                arr = this.splitList(files, batchFilesNum);

            this.setFilesList(arr);
        }
    };

    // initialize the variable values
    util.init({
        files: files,
        batchFilesNum: batchFilesNum
    });

    console.log(util.getFilesList());
    util.start(options);

  });

};
