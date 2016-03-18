"use strict";

var assert = require('core-assert'),
    json = require('nano-json'),
    timer = require('nano-timer'),
    Promise = require('nano-promise'),
    util = require('util'),
    Path = require('path'),
    fs = require('nano-fs');

var _console = {
		out: [],
		log:   function () { this.out.push(' '+util.format.apply(util, arguments)); },
		error: function () { this.out.push('E'+util.format.apply(util, arguments)); },
		warn:  function () { this.out.push('W'+util.format.apply(util, arguments)); }
	};

var Mill = require('../index.js');

suite('mill', function () {
	test('1 - then sched', function (done) {
		var src = Path.resolve(__dirname+'/../samples/src'),
		    dist = Path.resolve(__dirname+'/../samples/dist'),
		    opts = {
		    	plugins_folder: Path.resolve(__dirname+'/../samples/plugins'),
		    	sources_folder: src,
		    	dist_folder:    dist,
		    	dumps_folder:   Path.resolve(__dirname+'/../samples/log'),
		    	console: _console,
		    	gen: '',
		    	init: [ 'plugins > dist.clean | iinit > before' ],
		    	before: [ '> ibefore >' ],
		    	rules: {
		    		job: [ '> igen >' ],
		    		file: [ /^.*\.js$/, ' > file.load, case.upper, file.save >' ]
		    	},
		    	plugins: {
		    		iinit: function (log, data) {
		    			var opts = data;
		    			opts.gen += 'init';
		    		},
		    		ibefore: function (log, data) {
		    			var opts = data.opts;
		    			opts.gen += '-before';
		    		},
		    		igen: function (log, data) {
		    			var opts = data.opts;
		    			opts.gen += '-global';
		    		}
		    	}
		    },
		    mill = Mill(opts);

		mill.build().then(function () {
			assert.strictEqual(opts.gen, "init-before-global");
			return Promise.all([
				fs.readFile(src+'/job.js', 'utf8'),
				fs.readFile(dist+'/job.js', 'utf8')
			]).spread(function (s, d) {
				assert.strictEqual(d, s.toUpperCase());
				done();
			});
		}).catch(done);
	});

	test('2 - then sched', function (done) {
		var src = Path.resolve(__dirname+'/../samples/src'),
		    dist = Path.resolve(__dirname+'/../samples/dist'),
		    opts = {
		    	plugins_folder: Path.resolve(__dirname+'/../samples/plugins'),
		    	sources_folder: src,
		    	dist_folder:    dist,
		    	dumps_folder:   Path.resolve(__dirname+'/../samples/log'),
		    	console: _console,
		    	gen: '',
		    	//init: [ 'plugins > dist.clean | iinit > before' ],
		    	before: [ { bef: 'before' }, '> ibefore >' ],
		    	rules: {
		    		job: [ '> igen >' ],
		    		file: [ /^.*\.js$/, ' > file.load, case.upper, file.save >' ]
		    	},
		    	plugins: {
		    		iinit: function (log, data) {
		    			var opts = data;
		    			opts.gen += 'init';
		    		},
		    		ibefore: function (log, data) {
		    			var opts = data.opts;
		    			opts.gen += data.bef;
		    		},
		    		igen: function (log, data) {
		    			var opts = data.opts;
		    			opts.gen += '-global';
		    		}
		    	}
		    },
		    mill = Mill(opts);

		mill.build().then(function () {
			assert.strictEqual(opts.gen, "before-global");
			return Promise.all([
				fs.readFile(src+'/job.js', 'utf8'),
				fs.readFile(dist+'/job.js', 'utf8')
			]).spread(function (s, d) {
				assert.strictEqual(d, s.toUpperCase());
				done();
			});
		}).catch(done);
	});

	test('3 - then sched', function (done) {
		var src = Path.resolve(__dirname+'/../samples/src'),
		    dist = Path.resolve(__dirname+'/../samples/dist'),
		    opts = {
		    	plugins_folder: Path.resolve(__dirname+'/../samples/plugins'),
		    	sources_folder: src,
		    	dist_folder:    dist,
		    	dumps_folder:   Path.resolve(__dirname+'/../samples/log'),
		    	console: _console,
		    	gen: '',
		    	init: [ 'plugins > dist.clean | iinit > before' ],
		    	//before: [ { bef: 'before' }, '> ibefore >' ],
		    	rules: {
		    		job: [ '> igen >' ],
		    		file: [ /^.*\.js$/, { dest: '\\1\\2-\\3' }, ' > file.load, case.upper, file.rename, file.save >' ]
		    	},
		    	plugins: {
		    		iinit: function (log, data) {
		    			var opts = data;
		    			opts.gen += 'init';
		    		},
		    		ibefore: function (log, data) {
		    			var opts = data.opts;
		    			opts.gen += data.bef;
		    		},
		    		igen: function (log, data) {
		    			var opts = data.opts;
		    			opts.gen += '-global';
		    		}
		    	}
		    },
		    mill = Mill(opts);

		mill.build().then(function () {
			assert.strictEqual(opts.gen, "init-global");
			return Promise.all([
				fs.readFile(src+'/job.js', 'utf8'),
				fs.readFile(dist+'/job-.js', 'utf8')
			]).spread(function (s, d) {
				assert.strictEqual(d, s.toUpperCase());
				done();
			});
		}).catch(done);
	});
});
