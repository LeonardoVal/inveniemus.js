/** Package wrapper and layout.
*/
(function (global, init) { "use strict"; // Universal Module Definition.
	if (typeof define === 'function' && define.amd) {
		define(['creatartis-base', 'sermat'], init); // AMD module.
	} else if (typeof module === 'object' && module.exports) {
		module.exports = init(require('creatartis-base'), require('sermat')); // CommonJS module.
	} else { // Browser or web worker (probably).
		global.inveniemus = init(global.base, global.Sermat);
	}
})(this, function __init__(base, Sermat){ "use strict";
// Import synonyms. ////////////////////////////////////////////////////////////////////////////////
	var declare = base.declare,
		initialize = base.initialize,
		iterable = base.iterable,
		raiseIf = base.raiseIf,
		Events = base.Events,
		Future = base.Future,
		Iterable = base.Iterable,
		Logger = base.Logger,
		Randomness = base.Randomness,
		Statistics = base.Statistics;
	
// Library layout. /////////////////////////////////////////////////////////////////////////////////
	var exports = {
		__package__: 'inveniemus',
		__name__: 'inveniemus',
		__init__: __init__,
		__dependencies__: [base],
		__SERMAT__: { include: [] },
	/** `metaheuristics` is a bundle of available metaheuristics.
	*/	
		metaheuristics: {},
	/** `problems` is a bundle of classic and reference problems.
	*/
		problems: {}
	};
	var metaheuristics = exports.metaheuristics,
		problems = exports.problems;

// Utility functions. //////////////////////////////////////////////////////////////////////////////

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}