"use strict";

var fs = require('nano-fs'),
    Path = require('path');

module.exports = {

clean: function (log, data) {
	return fs.empty(data.dist_folder || (data.opts && data.opts.dist_folder));
}

};
