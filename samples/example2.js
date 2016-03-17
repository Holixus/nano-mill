var Mill = require('../');

var mill = Mill({
	plugins_folder: './plugins',
	sources_folder: './src',
	dist_folder: './dist',
	dumps_folder: './log',
	before: [
		'> dist.clean >'
	],
	rules: {
		file: [ /^.*$/, ' > file.load, cases >' ],
	},
	plugins: {
		cases: function (log, data) {
			var sched = log.job.sched;
			[ 'upper', 'lower', 'camel' ].forEach(function (type) {
				sched.job(data.name+'-'+type, {
					opts: data.opts,
					content: data.content,
					name: data.name,
					dest: '\\1'+type+'/\\2\\3'
				}).seq('> case.'+type+', file.rename, file.save >');
			});
		}
	}
});

mill.build().then(function() {
});
