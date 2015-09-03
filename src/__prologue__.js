/** Package wrapper and layout.
*/
(function (global, init) { "use strict"; // Universal Module Definition.
	if (typeof define === 'function' && define.amd) {
		define(['creatartis-base'], init); // AMD module.
	} else if (typeof module === 'object' && module.exports) {
		module.exports = init(require('creatartis-base')); // CommonJS module.
	} else { // Browser or web worker (probably).
		global.inveniemus = init(global.base);
	}
})(this, function __init__(base){ "use strict";
// Import synonyms. ////////////////////////////////////////////////////////////
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
	
// Library layout. /////////////////////////////////////////////////////////////
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
	