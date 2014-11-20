# grunt-cmsdeploy

> Node.js Grunt plugin. Deploy file content to a remote server

## Getting Started
This plugin requires Grunt `~0.4.4`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-cmsdeploy --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-cmsdeploy');
```

You can run this task as below:

```javascript
grunt cmsdeploy
```

or

```javascript
grunt cmsdeploy --auto
```

The late command will hot deploy all changed files automatically.

## The "cmsdeploy" task

### Overview
In your project's Gruntfile, add a section named `cmsdeploy` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  cmsdeploy: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.remoteServer
Type: `Object`
Default value: `{
				protocol: 'https',
				hostname: "localhost", 
				port: 443,
				path: "/",
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				}
			}`

A object value that is used to send client request to a remote server, all optoins from <a href="http://nodejs.org/api/http.html#http_http_request_options_callback">http.request()</a> are valid.

Here, the "protocol" field indicate whether this is a https client request or not.

#### options.postData
Type: `Object`
Default value: `{}`

A object value that is used to be sent to the server as the post data, default value is an empty object.

#### options.enhanceData
Type: `Function`
Default value: `function(postData, file, content)`

A function value that is used to enhance or modify the post data before sent to a remote server.
The first parameter will be the options.postData, the second parameter is the file path which is coming from the grunt build-in API this.filesSrc and the last parameter is the file content associated with that file.

### Usage Examples

#### Custom Options
In this example, custom options are used to do something else with whatever else.

```js
grunt.initConfig({
  cmsdeploy: {
    app:{
		options:{
			remoteServer: {
				"protocol": "https",
				"hostname": "localhost", 
				"port": 443,
				"path": "/",
				"method": "POST",
				"headers": {
					"target_host": "srwq03",
					"Authorization": "Bearer abcd1234",
					"Content-Type": "application/json"
				}
			},
			postData:{
				"metadata": {
					"release": "14.22"
				}
			},
			enhanceData: function(postData, filepath, content){
				var uri = '/resources/templates/',
					templatepath = '';
				
				if (filepath.indexOf('app-common') === 0 ) {
					templatepath = common + '/' + filepath.replace(/.*templates[^\w]*/i, '');
				}
				else {
					templatepath = appConfig.appName + '/' + filepath.replace(/.*templates[^\w]*/i, '');
				}
				
				postData.uri = uri + templatepath;
				postData.metadata.templateName = templatepath.replace(/\.dust/, '');
				postData.data = content;
				
				return postData;
			}
		},
		src: ['app/templates/**/*.dust', 'app-common/templates/**/*.dust']
	}
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
