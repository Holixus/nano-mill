"use strict";

module.exports = {

upper: function (log, data) {
	data.content = data.content.toUpperCase();
},

lower: function (log, data) {
	data.content = data.content.toLowerCase();
},

camel: function (log, data) {
	data.content = data.content.replace(/(.)(.?)/g, function (m, a, b) {
		return a.toUpperCase()+b.toLowerCase();
	});
}

};
