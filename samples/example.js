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
		UPPERCASE: [ /^.*$/, { dest: '\\1upper/\\2\\3' }, ' > file.load, case.upper, file.rename, file.save >' ],
		lowercase: [ /^.*$/, { dest: '\\1lower/\\2\\3' }, ' > file.load, case.lower, file.rename, file.save >' ],
		CaMeLcAsE: [ /^.*$/, { dest: '\\1camel/\\2\\3' }, ' > file.load, case.camel, file.rename, file.save >' ]
	}
});

mill.build().then(function() {
});
