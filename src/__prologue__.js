/** Package wrapper and layout.
*/
function __init__(base, Sermat){ "use strict";
// Import synonyms. ////////////////////////////////////////////////////////////////////////////////
	var declare = base.declare,
		iterable = base.iterable,
		initialize = base.initialize,
		raise = base.raise,
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
			__SERMAT__: { include: [] }
		},
	/** `metaheuristics` is a bundle of available metaheuristics.
	*/
		metaheuristics = exports.metaheuristics = {},
	/** `problems` is a bundle of classic and reference problems.
	*/
		problems = exports.problems = {},
	/** `utilities` is the namespace for miscelaneous utility functions and definitions.
	*/
		utilities = exports.utilities = {}
	;
