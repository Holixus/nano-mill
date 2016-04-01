"use strict";

var fs = require('nano-fs'),
    Promise = require('nano-promise'),
    Path = require('path');

module.exports = {

load: function (log, data) {
	var opts = data.opts,
	    src = Path.join(data.sources_folder || opts.sources_folder, data.name);
	return fs.readFile(src, data.encoding = 'utf8')
		.then(function (text) {
			data.content = text;
		});
},

'load-bin': function (log, data) {
	var opts = data.opts,
	    src = Path.join(data.sources_folder || opts.sources_folder, data.name);
	return fs.readFile(src, data.encoding = null)
		.then(function (text) {
			data.content = text;
		});
},

'dont-overwrite': function (log, data) {
	var opts = data.opts,
	    dest = Path.join(data.dist_folder || opts.dist_folder, data.dest || data.name);

	return fs.stat(dest).then(function (stat) {
		throw Promise.CANCEL_REASON;
	}, function (err) {
		/* istanbul ignore if */
		if (err.code !== 'ENOENT')
			throw err;
	});
},

'load-dist': function (log, data) {
	var opts = data.opts,
	    src = Path.join(data.dist_folder || opts.dist_folder, data.name);
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
	    dest = Path.join(data.dist_folder || data.opts.dist_folder, data.dest || data.name);

	if (data.encoding === 'utf8' && typeof data.content !== 'string')
		throw Error('data content is not a string');

	return fs.mkpath(Path.dirname(dest))
/*		.catch(function (err) {
			if (err.code !== 'EEXIST')
				throw err;
		})*/
		.then(function () {
			return fs.writeFile(dest, data.content, { encoding: data.encoding });
		});
},

copy: function (job, data, done) {
	var opts = data.opts,
	    src = Path.join(data.sources_folder || opts.sources_folder, data.name),
	    dst = Path.join(data.dist_folder || opts.dist_folder, data.name);

	return fs.copy(src, dst);
}

};
