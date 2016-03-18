var Mill = require('nano-sched'),
    fs = require('nano-fs'),
    Path = require('path'),
    Promise = require('nano-promise');

function defaults(opts, defs) {
	if (defs)
		for (var id in defs)
			if (!(id in opts))
				opts[id] = defs[id];
	return opts;
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
			return fs.readdir(opts.plugins_folder || /* istanbul ignore next */ './plugins')
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
			return fs.readTree(opts.sources_folder || /* istanbul ignore next */ './src')
				.then(function (list) {
					opts.files = list;
				});
		},
		'before': function (log, opts) {
			if (!opts.before)
				return;

			var sched = mill.sched(' before'),
			    before = opts.before,
			    args;

			if (typeof before[0] === 'object')
				args = before.splice(0,1)[0];

			var job = sched.job('before', defaults({
					opts: opts
				}, args));

			job.seq(before);

			return sched.start();
		},
		'rules': function (log, opts) {
			var sched = mill.sched(' rules'),
			    rules = opts.rules,
			    files = opts.files;

			for (var id in rules) {
				var rule = rules[id],
				    re,
				    args;

				if (rule[0] instanceof RegExp)
					re = rule.splice(0,1)[0];

				if (typeof rule[0] === 'object')
					args = rule.splice(0,1)[0];

				if (!re) {
					sched.job(id, defaults({
							opts: opts
						}, args)).seq(rule);
					continue;
				}

				files.forEach(function (name) {
					if (!re.test(name))
						return;
					var job = sched.job(name, defaults({
							opts: opts,
							name: name
						}, args));
					job.seq(rule);
				});
			}

			return sched.start();
		}
	});

	mill.build = function () {
		var sched = this.sched('mill'),
		    job = sched.job('init', mill.opts)
				.seq([
					' > mill.plugins > plugins', 'plugins >> before',
					' > mill.sources                      > before',
						'before > mill.before > rules', 'rules > mill.rules > ']);
			if (mill.opts.init)
				job.seq(mill.opts.init);
			return sched.start();
	};

	return mill;
};
