"use strict";

var fs = require('nano-fs'),
    Path = require('path');

module.exports = {

clean: function (log, data) {
	var opts = data.opts;
	return fs.empty(opts.dist_folder);
}

};
