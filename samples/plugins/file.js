"use strict";

var fs = require('nano-fs'),
    Path = require('path');

module.exports = {

load: function (log, data) {
	var opts = data.opts,
	    src = Path.join(opts.sources_folder, data.name);
	return fs.readFile(src, data.encoding = 'utf8')
		.then(function (text) {
			data.content = text;
		});
},

dist_load: function (log, data) {
	var opts = data.opts,
	    src = Path.join(opts.dist_folder, data.name);
	return fs.readFile(src, data.encoding = 'utf8')
		.then(function (text) {
			data.content = text;
		});
},

rename: function sync(log, data) {
	var dest = data.dest || data.name;

	if (dest.indexOf('\\') >= 0)
		dest = data.name.replace(/^(.*\/)?([^/]+)(\.[a-z0-9_]+)$/, dest.replace(/\\/g, '$'));

	data.dest = dest;
},

save: function (log, data) {
	var opts = data.opts,
	    dest = Path.join(data.opts.dist_folder, data.dest || data.name);

	if (typeof data.content !== 'string')
		throw Error('data content is not a string');

	return fs.mkpath(Path.dirname(dest))
		.then(function () {
			return fs.writeFile(dest, data.content, { encoding: data.encoding });
		});
},

copy: function (job, data, done) {
	var opts = data.opts,
	    src = Path.join(opts.sources_folder, data.name),
	    dst = Path.join(opts.dist_folder, data.name);

	return fs.copy(src, dst);
}

};
