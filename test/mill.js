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

function fsinit(opts) {
	return fs.empty(opts.dist_folder)
		.catch(function () {
			return fs.mkpath(opts.dist_folder);
		});
}


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
		    		file: [ /^.*\.js$/, ' > id-check, file.load, case.upper, file.save >' ]
		    	},
		    	plugins: {
		    		'id-check': function (log, data) {
		    			if (!data.id)
		    				throw Error('hasn`t id');
		    			if (data.id !== data.name.replace(/^.*?([^/]+)\.[a-z0-9]+$/i, '$1'))
		    				throw Error('wrong auto-id:"+data.id+"');
		    		},
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

		fsinit(opts).then(function () {
				return mill.build();
			})
			.then(function () {
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
		    	//init: [ 'plugins > dist.clean > before' ],
		    	//init: [ 'plugins > dist.clean | iinit > before' ],
		    	before: [ { bef: 'before' }, '> ibefore >' ],
		    	rules: {
		    		job: [ '> igen >' ],
		    		file: [ /^.*\.(js)$/, ' > id-check, file.load, case.upper, file.save >' ]
		    	},
		    	plugins: {
		    		'id-check': function (log, data) {
		    			if (!data.id)
		    				throw Error('hasn`t id');
		    			if (data.id !== 'js')
		    				throw Error('wrong auto-id:"+data.id+". should be "js"');
		    		},
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

		fsinit(opts).then(function () {
				return mill.build();
			})
			.then(function () {
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

		fsinit(opts).then(function () {
				return mill.build();
			})
			.then(function () {
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

	test('4 - then sched with sub-rules', function (done) {
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
		    		subRules: [ {
		    				sched_name: '  sub-sched',
		    				rules: {
		    					file: [ /^.*\.js$/, { dest: '\\1\\2-\\3' }, ' > file.load, case.upper, file.rename, file.save >' ]
		    				}
		    			}, '> mill.sources, mill.sched-rules >' ],
		    		subRules2: [ {
		    				sched_name: '  sub-sched2'
		    			}, '> mill.sources, mill.sched-rules >' ]
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

		fsinit(opts).then(function () {
				return mill.build();
			})
			.then(function () {
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

	test('5.1 - then sched with sub-rules', function (done) {
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
		    		job: [ '> igen, mill.dump-data >' ],
		    		subRules: [ {
		    				sched_name: '  sub-sched',
		    				sources_folder: './samples/src',
		    				dist_folder: './samples/dist',
		    				rules: {
		    					file: [ /^.*\.js$/, { dest: '\\1\\2-\\3' }, ' > file.load, case.upper, file.rename, file.save >' ]
		    				}
		    			}, '> mill.sources, mill.sched-rules >' ],
		    		subRules2: [ {
		    				sched_name: '  sub-sched2',
		    				rules: {
		    					abort: [ '> abort >' ]
		    				}
		    			}, '> mill.sources, mill.sched-rules >' ]
		    	},
		    	plugins: {
		    		abort: function (log, data) {
		    			throw 'abort';
		    		},
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

		fsinit(opts).then(function () {
				return mill.build();
			})
			.then(function () {
				throw Error('not aborted');
			}, function (err) {
				if (err === 'abort')
					return done();
				throw err;
			}).catch(done);
	});

	test('5.2 - then sched with sub-rules', function (done) {
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
		    		job: [ '> igen, mill.dump-data >' ],
		    		subRules: [ {
		    				sched_name: '  sub-sched',
		    				sources_folder: './samples/src',
		    				dist_folder: './samples/dist',
		    				rules: {
		    					file: [ /^.*\.js$/, { dest: '\\1\\2-\\3' }, ' > file.load, case.upper, file.rename, file.save >' ]
		    				}
		    			}, '> mill.sources, mill.sched-rules >' ],
		    		subRules2: [ {
		    				sched_name: '  sub-sched2'
		    			}, '> mill.sources, mill.sched-rules >' ]
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

		fsinit(opts).then(function () {
				return mill.build();
			})
			.then(function () {
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

	test('6 - without sources folder', function (done) {
		var opts = {
		    	plugins_folder: Path.resolve(__dirname+'/../samples/plugins'),
		    	dumps_folder:   Path.resolve(__dirname+'/../samples/log'),
		    	console: _console,
		    	gen: '',
		    	rules: {
		    		job: [ '> igen >' ]
		    	},
		    	plugins: {
		    		igen: function (log, data) {
		    			var opts = data.opts;
		    			opts.gen += '-global';
		    		}
		    	}
		    },
		    mill = Mill(opts);

		mill.build(opts)
			.then(function () {
				assert.strictEqual(opts.gen, "-global");
				done();
			}).catch(done);
	});

});
