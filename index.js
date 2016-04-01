var Mill = require('nano-sched'),
    fs = require('nano-fs'),
    Path = require('path'),
    Promise = require('nano-promise');

function defaults(opts, defs, defs2) {
	if (defs)
		for (var id in defs)
			if (!(id in opts))
				opts[id] = defs[id];
	if (defs2)
		for (var id in defs2)
			/* istanbul ignore else */
			if (!(id in opts))
				opts[id] = defs2[id];
	return opts;
}

var plugins = {
	'plugins': function readPlugins(log, opts) {
		var mill = log.job.sched.mill;
		return fs.readdir(opts.plugins_folder || /* istanbul ignore next */ './plugins')
			.then(function (list) {
				return Promise.all(list
					.map(function (name) {
						if (!/^[^.].*\.js$/.test(name))
							return;
						var filename = Path.join(opts.plugins_folder, name);
						return fs.readFile(filename, 'utf8')
							.then(function (text) {
								mill.install(name.replace(/([^/]*)\.js$/,'$1'), text, filename);
							});
					}));
		});
	},
	'sources': function readtree(log, data) {
		return fs.readTree(data.sources_folder || data.opts.sources_folder || /* istanbul ignore next */ './src')
			.then(function (list) {
				data.files = list;
			});
	},
	'before': function (log, opts) {
		if (!opts.before)
			return;

		var sched = log.job.sched.mill.sched(' before'),
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
	'sched-rules': function (log, data) {
		var sched = log.job.sched.mill.sched(data.sched_name || ' rules'),
		    opts = data.opts || data,
		    rules = data.rules,
		    files = data.files;

		if (!rules)
			return;

		var defs = {
			opts: opts
		};

		if (data.sources_folder && data.sources_folder !== opts.sources_folder)
			defs.sources_folder = data.sources_folder;
		if (data.dist_folder && data.dist_folder !== opts.dist_folder)
			defs.dist_folder = data.dist_folder;

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
					}, args, defs)).seq(rule);
				continue;
			}

			files.forEach(function (name) {
				var ok = re.exec(name);
				if (!ok)
					return;
				var job = sched.job(name, defaults({
						name: name,
						id: ok[1] || name.replace(/^.*([^/]+)\.[a-z0-9]+$/i, '$1')
					}, args, defs));
				job.seq(rule);
			});
		}

		return sched.start();
	},
	'dump-data': function (log, data) {
		return log.writeListing('dump-data', data);
	}

};

module.exports = function create(opts) {
	defaults(opts, {
		plugins_folder: './plugins',
		sources_folder: './src',
		dist_folder: './dist',
		dumps_folder: './log',
		rules: {}
	});

	var mill = Mill(opts);

	mill.install('mill', plugins);

	mill.build = function () {
		var sched = this.sched('mill'),
		    job = sched.job('init', mill.opts)
				.seq([
					' > mill.plugins > plugins', 'plugins >> before',
					' > mill.sources                      > before',
						'before > mill.before > rules', 'rules > mill.sched-rules > ']);
			if (mill.opts.init)
				job.seq(mill.opts.init);
			return sched.start();
	};

	return mill;
};
