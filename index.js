var Mill = require('nano-sched'),
    newUniFS = require('nano-unifs'),
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

function name2id(name) {
	return name.replace(/^.*?([^/]+)\.[a-z0-9]+$/i, '$1');
}

var plugins = {
	'plugins': function readPlugins(log, opts) {
		var mill = log.job.sched.mill,
		    fs = newUniFS(opts.plugins_folder || /* istanbul ignore next */ './plugins')
		return fs.listFiles('/')
			.then(function (list) {
				return Promise.all(list
					.map(function (name) {
						if (!/^[^.].*\.js$/.test(name))
							return;
						return fs.readFile(name, 'utf8')
							.then(function (text) {
								mill.install(name.replace(/([^/]*)\.js$/,'$1'), text, name);
							});
					}));
		});
	},
	'sources': function readtree(log, data) {
		var src = data.sources_folder || (data.opts && data.opts.sources_folder);
		if (!src)
			return data.files = [], 0;
		var fs = newUniFS(src)
		return fs.listFiles('/')
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
	'rules': function (log, data) {
		var sched_name = data.sched_name,
		    sched = log.job.sched,
		    opts = data.opts || data,
		    rules = data.rules,
		    files = data.files;

		if (!rules)
			return;

		if (sched_name)
			sched = log.job.sched.mill.sched(data.sched_name);

		var defs = {
			opts: opts
		};

		if (data.sources_folder && data.sources_folder !== opts.sources_folder)
			defs.sources_folder = data.sources_folder;
		if (data.dist_folder && data.dist_folder !== opts.dist_folder)
			defs.dist_folder = data.dist_folder;

		for (var id in rules) {
			var rule = rules[id],
			    re = undefined,
			    name = undefined,
			    args = undefined;

			if (rule[0] instanceof RegExp)
				re = rule.splice(0,1)[0];
			else
				if (typeof rule[0] === 'string' && rule[0].indexOf('>') < 0)
					name = rule.splice(0,1)[0];

			if (typeof rule[0] === 'object')
				args = rule.splice(0,1)[0];

			if (!re) {
				if (name)
					sched.job(id, defaults({
							name: name,
							id: name2id(name)
						}, args, defs)).seq(rule);
				else
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
						id: ok[1] || name2id(name)
					}, args, defs));
				job.seq(rule);
			});
		}

		if (sched_name)
			return sched.start().catch(function (err) {
				throw 'abort';
			});
	},
	'dump-data': function (log, data) {
		log.writeListing('json', data);
	},
	'dump-data-opts': function (log, data) {
		log.writeListing('json', data.opts);
	},
	'dump-opts': function (log, data) {
		log.writeListing('json', log.job.sched.opts);
	}

};

module.exports = function create(opts) {
	defaults(opts, {
		plugins_folder: './plugins',
		//sources_folder: './src',
		//dist_folder: './dist',
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
					' > mill.sources                       > before',
						'before > mill.before > rules', 'rules > mill.rules > ']);
			if (mill.opts.init)
				job.seq(mill.opts.init);
			return sched.start();
	};

	return mill;
};
