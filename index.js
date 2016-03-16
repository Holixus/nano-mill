var Mill = require('nano-sched'),
    fs = require('nano-fs'),
    Path = require('path'),
    Promise = require('nano-promise');

function defaults(opts, defs) {
	for (var id in defs)
		if (!(id in opts))
			opts[id] = defs[id];
}

module.exports = function create(opts) {
	defaults(opts, {
		plugins_folder: './plugins',
		sources_folder: './src',
		dist_folder: './dist',
		dumps_folder: './log',
		rules: {}
	});

	var mill = Mill(opts);

	mill.install('mill', {
		'plugins': function readPlugins(log, opts) {
			return fs.readdir(opts.plugins_folder || './plugins')
				.then(function (list) {
					return Promise.all(list
						.map(function (name) {
							if (!/^[^.].*\.js$/.test(name))
								return;
							return fs.readFile(Path.join(opts.plugins_folder, name), 'utf8')
								.then(function (text) {
									mill.install(name.replace(/([^/]*)\.js$/,'$1'), text);
								});
						}));
			});
		},
		'sources': function readtree(log, opts) {
			return fs.readTree(opts.src_folder || './src')
				.then(function (list) {
					opts.files = list;
				});
		},
		'rules': function sync(log, opts) {
			var sched = mill.sched(' rules'),
			    rules = opts.rules,
			    files = opts.files;

			for (var id in rules) {
				var rule = rules[id],
				    re = /./;

				if (rule[0] instanceof RegExp)
					re = rule.splice(0,1)[0];

				files.forEach(function (name) {
					if (!re.test(name))
						return;
					var job = sched.job(name, {
						opts: opts,
						name: name
					});
					rule.forEach(function (seq) {
						job.seq(seq);
					});
				});
			}

			return sched.start();
		}
	});

	mill.build = function () {
		return this.sched('build')
			.job('init', mill.opts)
				.seq(' > (mill.plugins | mill.sources), mill.rules > ')
				.up
			.start();
	};

	return mill;
};
