var Mill = require('nano-mill');

var mill = Mill({
	plugins_folder: './plugins',
	sources_folder: './src',
	dist_folder: './dist',
	dumps_folder: './log',
	rules: {
		'js': [ /^.*\.js$/, ' > file.load, upcase, file.save > ' ]
	}
});

mill.build().then(function() {
	mill.signal('all done');
});
