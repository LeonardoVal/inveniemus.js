/** Package wrapper and layout.
*/
"use strict";
(function (global, init) { // Universal Module Definition.
	if (typeof define === 'function' && define.amd) {
		define(['creatartis-base'], init); // AMD module.
	} else if (typeof module === 'object' && module.exports) {
		module.exports = init(require('creatartis-base')); // CommonJS module.
	} else { // Browser or web worker (probably).
		global.inveniemus = init(global.base);
	}
})(this, function __init__(base){
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
		__name__: 'inveniemus',
		__init__: __init__
	};
	__init__.dependencies = {'creatartis-base': base};

/**	# Class Element

Element is the term used in Inveniemus for representations of 
[candidate solutions](http://en.wikipedia.org/wiki/Feasible_region) in a search 
or optimization [problem](Problem.js.html). Implementations may declare their 
own subclass of `Element` to represent their candidate solutions.
*/
var Element = exports.Element = declare({
	/** All elements are defined by an array of numbers (i.e. the element's 
	`values`, random numbers by default) and an `evaluation` (`NaN` by default).
	
	The `values` store all data about the candidate solution this element 
	represents. This may appear to abstract and stark, but it helps	to separate 
	the problem definition from the search or optimization strategy.
	
	The element's `evaluation` is a numerical assessment of the represented 
	candidate solution. Usually is a measure of how well the problem is solved, 
	or how close the element is to a real solution. It guides almost all of the 
	metaheuristics.
	*/
	constructor: function Element(values, evaluation) {
		if (typeof values === 'undefined') {
			this.values = this.randomValues();
		} else {
			this.values = values.slice(); // Makes a shallow copy.
		}
		this.evaluation = +evaluation;
	},
	
	/** The class property `length` defines the size of the element's values 
	array (10 by default).
	*/
	length: 10,

	/** All numbers in an element's values range between `minimumValue` (0 by
	default) and `maximumValue` (1 by default).
	*/
	minimumValue: 0,
	maximumValue: 1,
	
	/** The pseudorandom number generator in the class property `random` is
	required by some of the element's operations. Its equal to 
	`base.Randomness.DEFAULT` by default.
	*/
	random: Randomness.DEFAULT,
	
	/** One of this operations is `randomValue()`, which returns a random value 
	between `this.minimumValue` and `this.maximumValue`.
	*/
	randomValue: function randomValue() {
		return this.random.random(this.minimumValue, this.maximumValue);
	},
	
	/** This method is used in `randomValues()` to calculate an array with 
	random numbers, suitable to be used as an element's `values`. Many
	metaheuristics require random initiation of the elements they handle.
	*/
	randomValues: function randomValues() {
		var values = new Array(this.length),
			offset = this.minimumValue,
			factor = this.maximumValue - this.minimumValue;
		for (var i = 0; i < this.length; i++) {
			values[i] = this.random.random() * factor + offset;
		}
		return values;
	},
	
	// ## Basic operations #####################################################
	
	/** The element's evaluation is calculated by `evaluate()`, which assigns 
	and returns this number. It can return a promise if the evaluation has to 
	be done asynchronously. This can be interpreted as the solutions cost in a 
	search problem or the target function of an optimization problem. The 
	default behaviour is adding up this element's values, useful only for 
	testing.
	*/
	evaluate: function evaluate() {
		return this.evaluation = iterable(this.values).sum();
	},

	/** Whether this element is a actual solution or not is decided by 
	`suffices()`. It holds the implementation of the goal test in search 
	problems. More complex criteria may be implemented in `Problem.suffices`.
	By default it checks if the values add up to zero, again only useful for
	testing purposes.
	*/
	suffices: function suffices() {
		return iterable(this.values).sum() === 0;
	},
	
	/** Usually a numbers array is just too abstract to handle, and	another 
	representation of the candidate solution must be build. For this `mapping()` 
	must be overridden to returns an alternate representation of this element 
	that may be fitter for evaluation or showing it to the user. By default it 
	just returns the same `values` array.
	*/
	mapping: function mapping() {
		return this.values;
	},

	/** The `emblem` of an element is a string that represents it and can be 
	displayed to the user. By default returns the JSON conversion of the 
	`values` array.
	*/
	emblem: function emblem() {
		return JSON.stringify(this.mapping());
	},

	// ## Evaluations ##########################################################

	/** The element's `resolution` is the minimal difference between elements'
	evaluations, below which two evaluations are considered equal.
	*/
	resolution: 1 / Math.pow(2, 52),
	
	/** The [Hamming distance](http://en.wikipedia.org/wiki/Hamming_distance) 
	between two arrays is the number of positions at which corresponding 
	components are different. Arrays are assumed to be of the same length. If 
	they are not, only the common parts are considered.
	*/
	hammingDistance: function hammingDistance(array1, array2) {
		return iterable(array1).zip(array2).filter(function (pair) {
			return pair[0] != pair[1];
		}).count();
	},

	/** The [Manhattan distance](http://en.wikipedia.org/wiki/Manhattan_distance) 
	between two arrays is the sum of the absolute differences of corresponding 
	positions.
	*/
	manhattanDistance: function manhattanDistance(array1, array2) {
		return iterable(array1).zip(array2).map(function (pair) {
			return Math.abs(pair[0] - pair[1]);
		}).sum();
	},

	/** The [euclidean distance](http://en.wikipedia.org/wiki/Euclidean_distance) 
	between two arrays is another option for evaluation.
	*/
	euclideanDistance: function euclideanDistance(array1, array2) {
		return Math.sqrt(iterable(array1).zip(array2).map(function (pair) {
			return Math.pow(pair[0] - pair[1], 2);
		}).sum());
	},

	/** Another common evaluation is the 
	[root mean squared error](http://en.wikipedia.org/wiki/Root_mean_squared_error).
	The method `rootMeanSquaredError` takes a function `f` (usually a mapping
	of this element) and some `data`. This `data` must be an iterable of arrays, 
	in which the first element is the expected result and the rest are the 
	arguments for the function.
	*/
	rootMeanSquaredError: function rootMeanSquaredError(f, data) {
		var length = 0,
			error = iterable(data).map(function (datum) {
				length++;
				return Math.pow(datum[0] - f.apply(this, datum.slice(1)), 2);
			}).sum()
		return length == 0 ? 0 : Math.sqrt(error / length);
	},

	// ## Expansions ###########################################################
	
	/** An element's `successors` are other elements that can be considered 
	adjacent of this element. By default returns the element's neighbourhood 
	with the default radius.
	*/
	successors: function successors(element) {
		return this.neighbourhood();
	},
	
	/** An element's `neighbourhood` is a set of new elements, with values 
	belonging to the n dimensional ball around this element's values with the
	given `radius` (1% by default). 
	*/
	neighbourhood: function neighbourhood(radius) {
		radius = isNaN(radius) ? (this.maximumValue - this.minimumValue) / 100 : +radius;
		var elems = [], 
			values = this.values,
			i, value;
		for (i = 0; i < values.length; i++) {
			value = values[i] + radius;
			if (value <= this.maximumValue) {
				elems.push(this.modification(i, value));
			}
			value = values[i] - radius;
			if (value >= this.minimumValue) {
				elems.push(this.modification(i, value));
			}
		}
		return elems;
	},
	
	/** The method `modification(index, value, ...)` returns a new and 
	unevaluated copy of this element, with its values modified as specified.
	*/
	modification: function modification() {
		var copy = new this.constructor(this.values), i, v;
		for (i = 0; i < arguments.length; i += 2) {
			v = +arguments[i + 1];
			raiseIf(isNaN(v) || v < this.minimumValue || v > this.maximumValue, "Invalid value ", v, " for element.");
			copy.values[arguments[i] | 0] = +arguments[i + 1];
		}
		return copy;
	},
	
	// ## Mappings #############################################################
	
	/** An array mapping builds an array of equal length of this element's 
	`values`. Each value is used to index the corresponding items argument. If 
	there are less arguments than the element's `length`, the last one is used 
	for the rest of the values. 
	*/
	arrayMapping: function arrayMapping() {
		var args = arguments, 
			lastItems = args[args.length - 1];
		raiseIf(args.length < 1, "Element.arrayMapping() expects at least one argument.");
		return this.values.map(function (v, i) {
			var items = args.length > i ? args[i] : lastItems;
			return items[v * items.length | 0];
		});
	},
	
	/** A set mapping builds an array of equal length of this element's 
	`values`. Each value is used to select one item. Items are not selected 
	more than once. 
	*/
	setMapping: function setMapping(items) {
		raiseIf(!Array.isArray(items), "Element.setMapping() expects an array argument.");
		items = items.slice(); // Shallow copy.
		return this.values.map(function (v, i) {
			return items.splice(v * items.length | 0, 1)[0];
		});
	},
	
	// ## Other utilities ######################################################

	/** A `clone` is a copy of this element.
	*/
	clone: function clone() {
		return new this.constructor(this.values, this.evaluation);
	},
	
	/** Two elements can be compared with `equals(other)`. It checks if the 
	other element has the same values and constructor than this one.
	*/
	equals: function equals(other) {
		if (this.constructor === other.constructor && this.values.length === other.values.length) {
			for (var i = 0, len = this.values.length; i < len; i++) {
				if (this.values[i] !== other.values[i]) {
					return false;
				}
			}
			return true;
		}
		return false;
	},
	
	/** The default string representation of an Element instance has this shape: 
	`"Element(values, evaluation)"`.
	*/
	toString: function toString() {
		return (this.constructor.name || 'Element') +"("+ JSON.stringify(this.values) +", "+ this.evaluation +")";
	}
}); // declare Element.


/**	## Class Problem

The Problem type represents a search or optimization problem in Inveniemus.
*/
var Problem = exports.Problem = declare({
	/** A problem should have a `title` to be displayed to the user.
	*/
	title: "<no title>",
		
	/** A `description` of the problem to be displayed to the user may also be
	appreciated.
	*/
	description: "<no description>",

	/** Many operations in this class require a pseudorandom number generator.
	By default `basis.Randomness.DEFAULT` is used.
	*/
	random: Randomness.DEFAULT,
	
	/** A Problem holds basically three things: the element constructor, the 
	comparison between elements and the sufficiency criteria.
	*/
	constructor: function Problem(params) {
		initialize(this, params)
			.string('title', { coerce: true, ignore: true })
			.string('description', { coerce: true, ignore: true })
			.object('random', { ignore: true })
		// Overrides.
			.func('representation', { ignore: true })
			.func('compare', { ignore: true })
			.func('suffices', { ignore: true });
	},

	/** The problem's candidate solution `representation` is a subclass of
	[`Element`](Element.js.html).
	*/
	representation: Element,
	
	/** How elements are compared with each other in the problem determines 
	which kind of optimization is performed. The `compare` method implements the 
	comparison between two elements. It follows the standard protocol of 
	comparison functions. Returns a positive number if element2 is better than 
	element1, a negative number if element2 is worse then element1, or zero 
	otherwise. 
	
	Better and worse may mean less or greater evaluation (`minimization`), 
	viceversa (`maximization`) or another criteria altogether. The default 
	implementation is `minimization`.
	*/
	compare: function compare(element1, element2) {
		return this.minimization(element1, element2);
	},
		
	/** When a set of elements is sufficient, the search/optimization ends. The
	method `suffices(elements)` returns true if inside the elements array there 
	are enough actual solutions to this problem. It holds the implementation of 
	the goal test in search problems. By default calls the `suffice` method of
	the first element (assumed to be the best).
	*/
	suffices: function suffices(elements) {
		return elements[0].suffices();
	},
	
	// ## Optimization modes ###################################################
		
	/** A `maximization` compares two elements by evaluation in descending 
	order.
	*/
	maximization: function maximization(element1, element2) {
		var d = element2.evaluation - element1.evaluation;
		return isNaN(d) ? -Infinity : Math.abs(d) < element1.resolution ? 0 : d;
	},
	
	/** A `minimization` compares two elements by evaluation in ascending order.
	*/
	minimization: function minimization(element1, element2) {
		var d = element1.evaluation - element2.evaluation;
		return isNaN(d) ? Infinity : Math.abs(d) < element1.resolution ? 0 : d;
	},
		
	/** An `approximation` compares two elements by distance of its evaluation 
	to the given target value in ascending order.
	*/
	approximation: function approximation(target, element1, element2) {
		var d = Math.abs(element1.evaluation - target) - Math.abs(element2.evaluation - target);
		return isNaN(d) ? Infinity : Math.abs(d) < element1.resolution ? 0 : d;
	},
		
	// ## Utility methods ######################################################
	
	/** The default string representation of a Problem instance has this shape: 
	`"Problem(params)"`.
	*/
	toString: function toString() {
		return (this.constructor.name || 'Problem') +"("+ JSON.stringify(this) +")";
	}
}); // declare Problem.
		
/** ## Namespace problems

A bundle of classic and reference problems.
*/
var problems = exports.problems = {};


/**	A [Metaheuristic](http://en.wikipedia.org/wiki/Metaheuristic) is an 
	optimization algorithm (which can also be used for searching).
*/
var Metaheuristic = exports.Metaheuristic = declare({
	/** Metaheuristic.logger:
		Logger used by the metaheuristic.
	*/
	logger: new Logger('inveniemus', Logger.ROOT, 'INFO'),
	
	/** new Metaheuristic(params):
		Base class of all metaheuristic algorithms, and hence of all 
		metaheuristic runs.
	*/
	constructor: function Metaheuristic(params) {
		initialize(this, params)
		/** Metaheuristic.problem:
			Definition of the problem this metaheuristic will try to solve.
		*/
			.object('problem', { defaultValue: null })
		/** Metaheuristic.size=100:
			Amount of candidate solutions the metaheuristic treats at each step.
		*/
			.number('size', { defaultValue: 100, coerce: true })
		/** Metaheuristic.state=[]:
			An array holding the elements this metaheuristic handles at each
			step.
		*/
			.array('state', { defaultValue: [] })
		/** Metaheuristic.steps=100:
			Number of steps this metaheuristic must perform.
		*/
			.number('steps', { defaultValue: 100, coerce: true })
		/** Metaheuristic.step=-1:
			Current iteration of this metaheuristic, or a negative number if
			it has not started yet.
		*/
			.integer('step', { defaultValue: -1, coerce: true })
		/** Metaheuristic.random=Randomness.DEFAULT:
			This metaheuristic's pseudorandom number generator. It is strongly
			advised to have only one for the whole process.
		*/
			.object('random', { defaultValue: Randomness.DEFAULT })
		/** Metaheuristic.statistics:
			The statistic gatherer for this metaheuristic.
		*/
			.object('statistics', { defaultValue: new Statistics() })
			.object('logger', { ignore: true });
		/** Metaheuristic.events:
			Event handler for this metaheuristic. The emitted events by default
			are: initiated, updated, expanded, evaluated, sieved, advanced, 
			analyzed & finished.
		*/
		this.events = new Events({ 
			events: ["initiated", "updated", "expanded", "evaluated", "sieved", 
				"advanced", "analyzed", "finished"]
		});
	},
	
	// Basic workflow. /////////////////////////////////////////////////////////
	
	/**	Metaheuristic.initiate(size=this.size):
		Builds and initiates this metaheuristic state with size new cursors. The
		elements are build using the initial() function.
	*/
	initiate: function initiate(size) {
		size = isNaN(size) ? this.size : +size >> 0;
		this.state = new Array(size);
		for (var i = 0; i < size; i++) {
			this.state[i] = new this.problem.representation(); // Element with random values.
		}
		this.events.emit('initiated', this);
		this.logger && this.logger.debug('State has been initiated. Nos coepimus.');
	},
	
	/** Metaheuristic.update():
		Updates this metaheuristic's state. It assumes the state has been 
		initialized. The process may be asynchronous, so it returns a Future.
		The default implementation first expands the state by calling 
		this.expand(), then evaluates the added elements by calling 
		this.evaluate(), and finally removes the worst elements with 
		this.sieve().
	*/
	update: function update() {
		var mh = this;
		this.expand();
		return this.evaluate().then(function () {
			mh.sieve();
			mh.events.emit('updated', this);
			return mh;
		});
	},
	
	/** Metaheuristic.expand(expansion=[]):
		Adds to this metaheuristic's state the given expansion. If none is given,
		this.expansion() is called to get new expansion.
	*/
	expand: function expand(expansion) {
		expansion = expansion || this.expansion();
		if (expansion.length < 1) {
			this.logger && this.logger.warn("Expansion is empty");
		} else {
			var expanded = this.state.concat(expansion),
				len = expanded.length;
			// Trim equal elements from the expanded state.
			expanded = expanded.filter(function (elem, i) {
				for (i++; i < len; i++) {
					if (elem.equals(expanded[i])) {
						return false;
					}
				}
				return true;
			});
			this.state = expanded;
		}
		this.events.emit('expanded', this);
		this.logger && this.logger.debug('State has been expanded. Nos exploramus.');
	},
	
	/** Metaheuristic.expansion(size):
		Returns an array of new elements to add to the current state. The 
		default implementation generates new random elements.		
	*/
	expansion: function expansion(size) {
		var expansionRate = isNaN(this.expansionRate) ? 0.5 : +this.expansionRate;
		size = isNaN(size) ? Math.floor(expansionRate * this.size) : +size;
		var elems = new Array(size), i;
		for (i = 0; i < size; i++){
			elems[i] = new this.problem.representation();
		}
		return elems;
	},
	
	/** Metaheuristic.evaluate(elements):
		Evaluates all the elements in this.state with no evaluation, using its
		evaluation method. After that sorts the state with the compare method
		of the problem.
		Returns a Future, regardless of the evaluation being asynchronous or 
		not.
	*/
	evaluate: function evaluate(elements) {
		var mh = this,
			evalTime = this.statistics.stat({key:'evaluation_time'});
		evalTime.startTime();
		elements = elements || this.state;
		return Future.all(iterable(elements).filter(
			function (element) { // For those elements that don't have an evaluation, ...
				return isNaN(element.evaluation);
			},
			function (element) { // ... evaluate them.
				return Future.when(element.evaluate());
			}
		)).then(function (results) {
			elements.sort(mh.problem.compare.bind(mh.problem));
			evalTime.addTime();
			mh.events.emit('evaluated', this);
			mh.logger && mh.logger.debug('Evaluated and sorted ', results.length, ' elements. Appretiatus sunt.');
			return elements;
		});
	},
	
	/** Metaheuristic.prototype.sieve(size=this.size):
		Cuts the current state down to the given size (or this.size by default).
		This is usually used after expanding and evaluating the state. The
		statistics of this metaheuristic are calculated here, right after the
		state is sieved.
	*/
	sieve: function sieve(size) {
		size = isNaN(size) ? this.size : size | 0;
		if (this.state.length > size) {
			this.state = this.state.slice(0, this.size);
		}
		this.events.emit('sieved', this);
		this.logger && this.logger.debug('State has been sieved. Viam selectus est.');
	},
	
	/** Metaheuristic.finished():
		Termination criteria for this metaheuristic. By default it checks if the
		number of passed iterations is not greater than this.steps.
	*/
	finished: function finished() {
		if (this.step >= this.steps || this.problem.suffices(this.state)) {
			this.events.emit('finished', this);
			return true;
		}
		return false;
	},

	/** Metaheuristic.analyze():
		Updates the process' statistics.
	*/
	analyze: function analyze() {
		var stat = this.statistics.stat({key:'evaluation', step: this.step});
		this.state.forEach(function (element) {
			stat.add(element.evaluation, element);
		});
		this.events.emit('analyzed', this);
		return stat;
	},
	
	/** Metaheuristic.advance():
		Performs one step of the optimization. If the process has not been 
		initialized, it does so. Returns a Future if the run has not finished or 
		null otherwise.
	*/
	advance: function advance() {
		var mh = this, 
			stepTime = this.statistics.stat({key: 'step_time'}),
			result;
		if (isNaN(this.step) || +this.step < 0) {
			this.statistics.reset();
			stepTime.startTime();
			this.initiate();
			result = this.evaluate();
		} else {
			stepTime.startTime();
			result = this.update();
		}
		return result.then(function () {
			mh.step = isNaN(mh.step) || +mh.step < 0 ? 0 : +mh.step + 1;
			mh.analyze(); // Calculate the state's stats after updating it.
			stepTime.addTime();
			mh.events.emit('advanced', this);
			mh.logger && mh.logger.info('Step ', mh.step , ' has been completed. Nos proficimus.');
			return mh;
		});
	},
	
	/** Metaheuristic.run():
		Returns a Future that is resolved when the whole search process is 
		finished. The value is the best cursor after the last step.
	*/
	run: function run() {
		var mh = this, 
			advance = this.advance.bind(this);
		function continues() {
			return !mh.finished();
		}
		return Future.doWhile(advance, continues).then(function () {
			mh.logger && mh.logger.info('Finished. Nos invenerunt!');
			return mh.state[0]; // Return the best cursor.
		});
	},

	/** Metaheuristic.reset():
		Reset the process to start over again. Basically cleans the stats and 
		sets the current step to -1.
	*/
	reset: function reset() {
		this.step = -1;
		this.statistics.reset();
	},
	
	// Utility methods. ////////////////////////////////////////////////////////
	
	toString: function toString() {
		return (this.constructor.name || 'Metaheuristic') +"("+ JSON.stringify(this) +")";
	}	
}); // declare Metaheuristic.

/** metaheuristics:
	Bundle of metaheuristics available.
*/
var metaheuristics = exports.metaheuristics = {};

/** [Hill Climbing](http://en.wikipedia.org/wiki/Hill_climbing) implementation 
	for the Inveniemus library.
*/
var HillClimbing = metaheuristics.HillClimbing = declare(Metaheuristic, {
	/** new metaheuristics.HillClimbing(params):
		Builds a [hill climbing](http://en.wikipedia.org/wiki/Hill_climbing) 
		search.
	*/
	constructor: function HillClimbing(params) {
		Metaheuristic.call(this, params);
		initialize(this, params)
		/** metaheuristics.HillClimbing.delta=0.01:
			The radius of the elements surroundings in every dimension, that is
			checked by this algorithm.
		*/
			.number('delta', { defaultValue: 0.01, coerce: true })
		/** metaheuristics.HillClimbing.size=1:
			Default value for size is 1.
		*/
			.integer('size', { defaultValue: 1,	coerce: true });
	},
	
	/** metaheuristics.HillClimbing.update():
		Each element in the state is replaced by the best element in its 
		neighbourhood, if there is any. The surroundings have all possible 
		elements resulting from either an increment or decrement (of the given
		delta) in each of the centre element's dimensions.
	*/
	update: function update() {
		var mh = this, 
			localOptima = 0;
		return Future.all(this.state.map(function (elem) {
			var range = elem.neighbourhood(mh.delta);
			range.push(elem);
			return mh.evaluate(range).then(function (range) {
				var best = range[0];
				if (elem === best) {
					localOptima++;
				}
				return best;
			});			
		})).then(function (elems) {
			mh.state = elems;
			mh.__localOptima__ = localOptima;
		});
	},
		
	/** metaheuristics.HillClimbing.atLocalOptima():
		Checks if the search is currently stuck at local optima.
	*/
	atLocalOptima: function atLocalOptima() {
		return this.__localOptima__ >= this.state.length;
	},
		
	/** metaheuristics.HillClimbing.finished():
		Hill climbing search must finish when a local optimum is reached. This
		criteria is tested together with all others.
	*/
	finished: function finished() {
		return Metaheuristic.prototype.finished.call(this) || this.atLocalOptima();
	},
		
	// Utility methods. ////////////////////////////////////////////////////////
		
	toString: function toString() {
		return (this.constructor.name || 'HillClimbing') +'('+ JSON.stringify(this) +')';
	}
}); // declare HillClimbing.


/** Classic Holland's-style [genetic algorithms](http://en.wikipedia.org/wiki/Genetic_algorithm)
	for the Inveniemus library.
*/
var GeneticAlgorithm = metaheuristics.GeneticAlgorithm = declare(Metaheuristic, {
	/** new metaheuristics.GeneticAlgorithm(params):
		Builds a genetic algorithm, the base for many evolutionary computing
		variants.
	*/
	constructor: function GeneticAlgorithm(params) {
		Metaheuristic.call(this, params); // Superconstructor call.
		initialize(this, params)
		/** metaheuristics.GeneticAlgorithm.expansionRate=0.5:
			The amount of new elements generated by crossover, as a ratio of the
			population size.
		*/
			.number('expansionRate', { defaultValue: 0.5, minimum: 0, coerce: true })
		/** metaheuristics.GeneticAlgorithm.mutationRate=0.2:
			The chance of a new element (resulting from crossover) mutating.
		*/
			.number('mutationRate', { defaultValue: 0.2, minimum: 0, maximum: 1, coerce: true })
		/** metaheuristics.GeneticAlgorithm.selection(count):
			Selects count elements from the current population. These will be 
			the parents of the new elements in the next generation.
			By default rank selection is used, a.k.a. fitness proportional
			to position in the state.
		*/
			.func('selection', { defaultValue: GeneticAlgorithm.selections.rankSelection })
		/** metaheuristics.GeneticAlgorithm.crossover(parents):
			Genetic operator that simulates reproduction with inheritance. The 
			parents argument must be an array of elements. The result is an 
			array of elements.
			By default the single point crossover is used.
		*/
			.func('crossover', { defaultValue: GeneticAlgorithm.crossovers.singlepointCrossover })
		/** metaheuristics.GeneticAlgorithm.mutation(element):
			Genetic operator that simulates biological mutation, making a random
			change in the chromosome.
			By default a single point uniform mutation is used.
		*/
			.func('mutation', { defaultValue: GeneticAlgorithm.mutations.singlepointUniformMutation });
	},

	/** metaheuristics.GeneticAlgorithm.expansion():
		Returns the possibly mutated crossovers of selected elements. How many 
		is determined by this.expansionRate.
	*/
	expansion: function expansion() {
		var parents, childs, child,
			newElements = [],
			len = Math.floor(this.expansionRate * this.size);
		len += len % 2; // Make len even.
		for (var i = 0; i < len; i += 2) {
			parents = this.selection();
			childs = this.crossover(parents);
			for (var j = 0; j < childs.length; j++) {
				child = this.random.randomBool(this.mutationRate) ? this.mutation(childs[j]) : childs[j];
				newElements.push(child);
			}
		}
		return newElements;
	},
	
	// Utility methods. ////////////////////////////////////////////////////////
	
	toString: function toString() {
		return (this.constructor.name || 'GeneticAlgorithm')+ '('+ JSON.stringify(this) +')';
	}
}); // declare GeneticAlgorithm.
	
/** static metaheuristics.GeneticAlgorithm.selections:
	Bundle of standard selection methods. A selection function takes the
	amount of elements to be selected and returns an array of selected
	elements.
*/
GeneticAlgorithm.selections = {
	/** metaheuristics.GeneticAlgorithm.selection.rankSelection(count=2):
		Makes a selection where each element's probability of being selected is
		proportional to its position in the state.
	*/
	rankSelection: function rankSelection(count) {
		count = isNaN(count) ? 2 : +count;
		var len = this.state.length,
			randoms = this.random.randoms(count, 0, len * (len + 1) / 2 - 1),
			selected = [];
		randoms.sort(function (x, y) { 
			return x - y; 
		});
		this.state.forEach(function (element) {
			for (var i = 0; i < count; i++) {
				randoms[i] += i - len;
			}
			if (randoms[0] <= 0) {
				selected.push(element);
				randoms.shift();
			}
		});
		if (selected.length < count) { // Should not happen.
			selected = selected.concat(this.state.slice(0, count - selected.length));
		}
		return selected;
	},
	
	/** metaheuristics.GeneticAlgorithm.selections.rouletteSelection(count=2):
		Makes a selection where each element's probability of being selected is
		proportional to its evaluation.
		Warning! This selection assumes the evaluation is being maximized.
	*/
	rouletteSelection: function rouletteSelection(count) { //FIXME
		count = isNaN(count) ? 2 : +count;
		var len = this.state.length,
			evaluationStat = this.statistics.stat({key: 'evaluation', step: this.step}),
			min = evaluationStat.minimum(),
			sum = evaluationStat.sum(),
			randoms = this.random.randoms(count, 0, sum - len * min),
			selected = [];
		randoms.sort(function (x, y) { return x-y; });
		this.state.forEach(function (element) {
			for (var i = 0; i < count; i++) {
				randoms[i] += i - len;
			}
			if (randoms[0] <= 0) {
				selected.push(element);
				randoms.shift();
			}
		});
		if (selected.length < count) { // Should not happen.
			selected = selected.concat(this.state.slice(0, count - selected.length));
		}
		return selected;
	}
}; // GeneticAlgorithm.selections

/** metaheuristics.GeneticAlgorithm.crossovers:
	Bundle of standard crossover methods. A crossover function takes an 
	array of parent elements and returns an array of sibling elements.
*/
GeneticAlgorithm.crossovers = {
	/** metaheuristics.GeneticAlgorithm.crossovers.singlepointCrossover(parents):
		Given two parents, returns an array of two new elements built with one
		half of each parent. The cutpoint is chosen randomly.
	*/
	singlepointCrossover: function singlepointCrossover(parents) {
		raiseIf(!Array.isArray(parents) || parents.length < 2, "A two parent array is required.");
		var cut = this.random.randomInt(this.length - 1) + 1,
			values0 = parents[0].values,
			values1 = parents[1].values,
			elementConstructor = this.problem.representation;
		return [ 
			new elementConstructor(values0.slice(0, cut).concat(values1.slice(cut))),
			new elementConstructor(values1.slice(0, cut).concat(values0.slice(cut)))
		];
	}	
}; // GeneticAlgorithm.crossovers
	
/** metaheuristics.GeneticAlgorithm.mutations:
	Bundle of standard mutation methods.
*/
GeneticAlgorithm.mutations = {
	/** metaheuristics.GeneticAlgorithm.mutations.singlepointUniformMutation(element):
		Sets a randomly selected gene to a uniform random value.
	*/
	singlepointUniformMutation: function singlepointUniformMutation(element) {
		return element.modification(this.random.randomInt(element.length), element.randomValue());
	},
		
	/** metaheuristics.GeneticAlgorithm.mutations.uniformMutation(maxPoints=Infinity):
		Builds a mutation function that makes at least one and up to maxPoints 
		mutations, changing a randomly selected gene to a uniform random value.
	*/
	uniformMutation: function uniformMutation(maxPoints) {
		max = isNaN(maxPoints) ? Infinity : +maxPoints;
		return function mutation(element) {
			var times = maxPoints;
			element = new element.constructor(element.values); // Copy element.
			do {
				element.values[this.random.randomInt(element.length)] = element.randomValue();
			} while (this.random.randomBool(this.mutationRate) && --times > 0);
			return element;
		};
	},
	
	/** metaheuristics.GeneticAlgorithm.mutations.singlepointBiasedMutation(element):
		Sets a randomly selected gene to random deviation of its value, with a
		triangular distribution.
	*/
	singlepointBiasedMutation: function singlepointBiasedMutation(element) {
		return element.modification(this.random.randomInt(element.length),
			Math.max(element.minimumValue, Math.min(element.maximumValue, 
				element.values[i] + this.random.random() - this.random.random()
			))
		);
	}
}; // GeneticAlgorithm.mutations


/** [Beam search](http://en.wikipedia.org/wiki/Beam_search) implementation for 
	the Inveniemus library. It is a form of parallel best-first search with 
	limited memory.
*/
var BeamSearch = metaheuristics.BeamSearch = declare(Metaheuristic, {
	/** new metaheuristics.BeamSearch(params):
		Builds a beam search. The problem's element must have its successors 
		method implemented.
	*/
	constructor: function BeamSearch(params) {
		Metaheuristic.call(this, params);
	},
	
	/** metaheuristics.BeamSearch.successors(element):
		Returns the elements' successors. By default returns 
		element.successors().
	*/
	successors: function successors(element) {
		return element.successors();
	},
	
	/** metaheuristics.BeamSearch.expansion():
		Successors to all elements are calculated by calling the problem's
		successors method.
	*/
	expansion: function expansion() {
		var allSuccessors = [],
			successors = this.successors.bind(this);
		this.state.forEach(function (element) {
			allSuccessors = allSuccessors.concat(successors(element));
		});
		return allSuccessors;
	},
		
	// Utility methods. ////////////////////////////////////////////////////////
		
	toString: function toString() {
		return (this.constructor.name || 'BeamSearch') +'('+ JSON.stringify(this) +')';
	}
}); // declare BeamSearch.


/** [Simulated annealing](http://en.wikipedia.org/wiki/Simulated_annealing) 
	implementation for the Inveniemus library.
*/
var SimulatedAnnealing = metaheuristics.SimulatedAnnealing = declare(Metaheuristic, {
	/** new metaheuristics.SimulatedAnnealing(params):
		Builds a simulated annealing search.
		See <http://en.wikipedia.org/wiki/Simulated_annealing>.
	*/
	constructor: function SimulatedAnnealing(params) {
		Metaheuristic.call(this, params);
		initialize(this, params)
		/** metaheuristics.SimulatedAnnealing.maximumTemperature=1:
			The temperature at the start of the run.
		*/
			.number('maximumTemperature', { defaultValue: 1, coerce: true })
		/** metaheuristics.SimulatedAnnealing.minimumTemperature=1:
			The temperature at the end of the run.
		*/
			.number('minimumTemperature', { defaultValue: 0, coerce: true })
		/** metaheuristics.SimulatedAnnealing.delta=0.01:
			The radius of the elements surroundings in every dimension, that is
			checked by this algorithm.
		*/
			.number('delta', { defaultValue: 0.01, coerce: true })
		/** metaheuristics.SimulatedAnnealing.size=1:
			Default value for size is 1.
		*/
			.integer('size', { defaultValue: 1,	coerce: true });
	},
	
	/** metaheuristics.SimulatedAnnealing.randomNeighbour(element, radius=this.delta):
		Returns one neighbour of the given element chosen at random.
	*/
	randomNeighbour: function randomNeighbour(element, radius) {
		radius = isNaN(radius) ? this.delta : +radius;
		var i = this.random.randomInt(element.values.length), 
			v = element.values[i];
		if (this.random.randomBool()) {
			v = Math.min(element.maximumValue, v + radius);
		} else {
			v = Math.max(element.minimumValue, v - radius);
		}
		return element.modification(i, v);
	},
	
	/** metaheuristics.SimulatedAnnealing.acceptance(current, neighbour, temp=this.temperature()):
		Returns the probability of accepting the new element. Uses the original
		definitions from Kirkpatrick's paper.
	*/
	acceptance: function acceptance(current, neighbour, temp) {
		temp = isNaN(temp) ? this.temperature() : +temp;
		if (this.problem.compare(current, neighbour) > 0) {
			return 1; // Should always accept a better neighbour.
		} else {
			var d = -Math.abs(neighbour.evaluation - current.evaluation);
			return Math.min(1, Math.exp(d / temp));
		}
	},
	
	/** metaheuristics.SimulatedAnnealing.temperature():
		Returns the current temperature of the annealing.
	*/
	temperature: function temperature() {
		return (1 - Math.max(0, this.step) / this.steps) * (this.maximumTemperature - this.minimumTemperature) + this.minimumTemperature;
	},
	
	/** metaheuristics.SimulatedAnnealing.update():
		For each element in the state one of its neighbours is chosen randomly. If
		the neighbour is better, it replaces the corresponding element. Else it
		may still do so, but with a probability calculated by this.acceptance().
	*/
	update: function update() {
		var mh = this,
			temp = this.temperature(),
			acceptanceStat = this.statistics.stat({key: 'acceptance'}),
			temperatureStat = this.statistics.stat({key: 'temperature'});
		temperatureStat.add(temp, this.step);
		return Future.all(this.state.map(function (elem) {
			var neighbour = mh.randomNeighbour(elem);
			return Future.when(neighbour.evaluate()).then(function () {
				var p = mh.acceptance(elem, neighbour, temp);
				acceptanceStat.add(p, neighbour);
				if (mh.random.randomBool(p)) {
					return neighbour;
				} else {
					return elem;
				}
			});
		})).then(function (elems) {
			return mh.state = elems;
		});
	},

	// Utility methods. ////////////////////////////////////////////////////////
		
	toString: function toString() {
		return (this.constructor.name || 'SimulatedAnnealing') +'('+ JSON.stringify(this) +')';
	}
}); // declare SimulatedAnnealing.


/** A class of very simple problems that deal with optimizing the sum of the
	elements' values. Probably the simplest optimization problem that can be 
	defined, included here for testing purposes.
*/
problems.SumOptimization = declare(Problem, { ////////////////////////////
	title: "Sum optimization",
	description: "Very simple problem based on optimizing the elements' values sum.",

	/** new problems.SumOptimization(params):
		Very simple problem based on optimizing the elements' values sum. The
		params argument should include the 'target' number.
	*/
	constructor: function SumOptimization(params) {
		Problem.call(this, params);
		initialize(this, params)
			.number('target', { coerce: true, defaultValue: -Infinity });
	},
	
	representation: declare(Element, {
		evaluate: function evaluate() {
			return this.evaluation = iterable(this.values).sum();
		}
	}),
	
	/** problems.SumOptimization.suffices(elements):
		Checks if the best element's values add up to the target value.
	*/
	suffices: function suffices(elements) {
		return iterable(elements[0].values).sum() === this.target;
	},
	
	/** problems.SumOptimization.compare(element1, element2):
		The comparison between elements depends on this problem's target. For
		a Infinity maximization is applied, for -Infinity minimization, and
		for every other number approximation.
	*/
	compare: function compare(element1, element2) {
		return this.target === -Infinity ? this.minimization(element1, element2)
			: this.target === Infinity ? this.maximization(element1, element2)
			: this.approximation(this.target, element1, element2);
	}
}); // declare SumOptimization.


/** As it sounds, HelloWorld is a simple problem class, probably only useful for
	testing purposes.
*/
problems.HelloWorld = declare(Problem, { /////////////////////////////////
	title: "Hello world",
	description: "Simple problem where each element is a string, and the "+
		"optimization goes towards the target string.",
	
	/** new problems.HelloWorld(params):
		Simple problem where each element is a string, and the optimization 
		goes towards the target string. The string to match is specified by the
		'target' parameter.
	*/	
	constructor: function HelloWorld(params){
		Problem.call(this, params);
		initialize(this, params)
			.string('target', { coerce: true, defaultValue: 'Hello world!' });
		
		var target = this.target,
			__target__ = iterable(target).map(function (c) {
				return c.charCodeAt(0);
			}).toArray();
		// Ad hoc Element declaration.
		this.representation = declare(Element, {
			length: target.length,
			minimumValue: 32,
			maximumValue: 254,
			suffices: function suffices() {
				return this.mapping() === target;
			},
			evaluate: function evaluate() {
				return this.evaluation = this.manhattanDistance(__target__, this.values);
			},
			mapping: function mapping() {
				return iterable(this.values).map(function (n) {
					return String.fromCharCode(n | 0);
				}).join('');
			}
		});
	},
	
	compare: Problem.prototype.minimization
}); // declare HelloWorld.


/** A generalized version of the classic [8 queens puzzle](http://en.wikipedia.org/wiki/Eight_queens_puzzle).
*/
problems.NQueensPuzzle = declare(Problem, { ////////////////////////////
	title: "N-queens puzzle",
	description: "Generalized version of the classic problem of placing "+
		"8 chess queens on an 8x8 chessboard so that no two queens attack each other.",
	
	/** new problems.NQueensPuzzle(params):
		Generalized version of the classic problem of placing 8 chess queens on 
		an 8x8 chessboard so that no two queens attack each other. The amount
		of queens and board dimensions is specified by the N parameter.
	*/	
	constructor: function NQueensPuzzle(params){
		Problem.call(this, params);
		initialize(this, params)
			.integer('N', { coerce: true, defaultValue: 8 });
		
		// Ad hoc Element declaration.
		var rowRange = Iterable.range(this.N).toArray();
		/** problems.NQueensPuzzle.representation:
			The representation is an array of N positions, indicating the row of
			the queen for each column. Its evaluation is the count of diagonals
			shared by queens pairwise.
		*/
		this.representation = declare(Element, {
			length: this.N,
			suffices: function suffices() {
				return this.evaluation === 0;
			},
			evaluate: function evaluate() {
				var rows = this.mapping(),
					count = 0;
				rows.forEach(function (row, i) {
					for (var j = 1; i + j < rows.length; j++) {
						if (rows[j] == row + j || rows[j] == row - j) {
							count++;
						}
					}
				});
				return this.evaluation = count;
			},
			mapping: function mapping() {
				return this.setMapping(rowRange);
			}
		});
	},
	
	compare: Problem.prototype.minimization
}); // declare NQueensPuzzle


/** The [Knapsack problem](http://en.wikipedia.org/wiki/Knapsack_problem) is a
	classic combinatorial optimization problem. Given a set of items, each with 
	cost and worth, a selection must be obtained (to go into the knapsack) so
	that the total cost does not exceed a certain limit, while maximizing the 
	total worth.
*/
problems.KnapsackProblem = declare(Problem, { ////////////////////////////
	title: "Knapsack problem",
	description: "Given a set of items with a cost and a worth, select a subset "+
		" maximizing the worth sum but not exceeding a cost limit.",
	
	/** problems.KnapsackProblem.items:
		The superset of all candidate solutions. Must be an object with each
		item by name. Each item must have a cost and a worth, and may have an
		amount (1 by default).
	*/
	items: {
		itemA: { cost: 12, worth:  4 }, 
		itemB: { cost:  2, worth:  2 }, 
		itemC: { cost:  1, worth:  2 }, 
		itemD: { cost:  1, worth:  1 },
		itemE: { cost:  4, worth: 10 }
	},
	
	/** new problems.KnapsackProblem(params):
		Classic combinatorial optimization problem, based on a given a set of 
		items, each with a cost and a worth. The solution is a subset of items
		with maximum worth sum that does not exceed a cost limit.
	*/	
	constructor: function KnapsackProblem(params){
		Problem.call(this, params);
		initialize(this, params)
			/** problems.KnapsackProblem.limit=15:
				Cost limit that candidate solution should not exceed.
			*/
			.number('limit', { coerce: true, defaultValue: 15 })
			/** problems.KnapsackProblem.defaultAmount=1:
				Amount available for each item by default.
			*/
			.integer('amount', { coerce: true, defaultValue: 1, minimum: 1 })
			.object('items', { ignore: true });
		
		// Ad hoc Element declaration.
		var problem = this;
		/** problems.KnapsackProblem.representation:
			The representation is an array with a number for each item. This
			number holds the selected amount for each item (from 0 up to the
			item's amount).
		*/
		this.representation = declare(Element, {
			length: Object.keys(this.items).length,
			evaluate: function evaluate() {
				var selection = this.mapping(),
					worth = 0,
					cost = 0;
				Object.keys(selection).forEach(function (name) {
					var item = problem.items[name],
						amount = selection[name];
					worth += item.worth * amount;
					cost += item.cost * amount;
				});
				return this.evaluation = cost > problem.limit ? -worth : worth;
			},
			mapping: function mapping() {
				var selection = {},
					keys = Object.keys(problem.items);
				keys.sort();
				iterable(this.values).zip(keys).forEach(function (pair) {
					var item = problem.items[pair[1]],
						amount = pair[0] * (1 + (+item.amount || 1)) | 0;
					selection[pair[1]] = amount;
				});
				return selection;
			}
		});
	},
	
	compare: Problem.prototype.maximization
}); // declare KnapsackProblem

// See __prologue__.js
	return exports;
});

//# sourceMappingURL=inveniemus.js.map