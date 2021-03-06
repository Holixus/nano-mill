"use strict";

var Promise = require('nano-promise');

/* ------------------------------------------------------------------------ */
function newSeq(job, start, ast) {

	function op(ps, ast) {
		if (!ast)
			return Promise.resolve(); // empty AST

		switch (ast[0]) {
		case 'seq':
			for (var i = 1, n = ast.length; i < n; ++i)
				ps = op(ps, ast[i]);
			return ps;

		case 'paral':
			var all = [];
			for (var i = 1, n = ast.length; i < n; ++i)
				all.push(op(ps, ast[i]));
			return Promise.all(all);

		case 'stage':
			return job.stage(ps, ast.slice(1));
		}

		/* istanbul ignore next */
		return Promise.reject(Error('invalid sequence AST'));
	}
	return op(start, ast);
}

module.exports = newSeq;
