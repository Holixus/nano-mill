"use strict";

var fs = require('nano-fs'),
    Path = require('path');

module.exports = {

clean: function (log, data) {
	var dist_folder = data.dist_folder || (data.opts && data.opts.dist_folder);
	return fs.mkpath(dist_folder).then(function () {
		return fs.empty(dist_folder);
	});
}

};
