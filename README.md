# grunt-cmsdeploy

> Node.js Grunt plugin. Deploy file content to a remote server

## Getting Started
This plugin requires Grunt `~0.4.x`

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

#### options.delayTime
Type: `Number`
Default value: `0`

A number value that is used to specify the delay time betweening each batch files sent to the remote iCMS server. Default value is 0 millisecond.

#### options.batchFilesNum
Type: `Number`
Default value: `500`

A number value that is used to specify the total files number in each batch which will be sent to the remote iCMS server. Default value is 500.

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
			},
			delayTime: 200,
			batchFilesNum: 5
		},
		src: ['app/templates/**/*.dust', 'app-common/templates/**/*.dust']
	}
  },
});
```

#### Notes
Please note that the `Content-Type` here specified in the **http.request** options will be used in the remote server. By default when use **JAVA Servlets** and **Tomcat** as the web server and use `request.getParameter` method, you have to specify the `Content-Type` as the value `application/x-www-form-urlencoded` and use `JSON.stringify` in client side to stringify the JSON data which will be posted to the remote server in order to get the correct parameter vaule.

But if the `Content-Type` is **application/json** that does not means server side does not understand it, acutally it depends. For example if using the CXF framework and configuration is correct in server side then it can also get the parameter correctly, but by default you can specify any values for the `Content-Type` if the server read the raw binary data like the link below: <a href="http://stackoverflow.com/questions/3831680/httpservletrequest-get-post-data">Http Servlets Request Get Post Data</a>

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
