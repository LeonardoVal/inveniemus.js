/**	# Element

Element is the term used in Inveniemus for representations of 
[candidate solutions](http://en.wikipedia.org/wiki/Feasible_region) in a search or optimization 
[problem](Problem.js.html). Implementations may declare their own subclass of `Element` to represent
their candidate solutions.
*/
var Element = exports.Element = declare({
	/** All elements are defined by a `problem`, an array of numbers (i.e. the element's `values`, 
	random numbers by default) and an `evaluation` (`NaN` by default). The element's values are 
	coerced to be in the range provided by the problem's element model.
	
	The `values` store all data about the candidate solution this element represents. This may 
	appear to abstract and stark, but it helps to separate the problem definition from the search
	or optimization strategy.
	
	The element's `evaluation` is a numerical assessment of the represented candidate solution. 
	Usually is a measure of how well the problem is solved, or how close the element is to a real 
	solution. It guides almost all of the metaheuristics.
	*/
	constructor: function Element(problem, values, evaluation) {
		this.problem = problem;
		var model = problem.elementModel();
		if (!values) {
			this.values = model.map(function (range) {
				if (range.discrete) {
					return problem.random.randomInt(range.min, range.max + 1);
				} else {
					return problem.random.random(range.min, range.max);
				}
			});
		} else {
			this.values = values.map(function (value, i) {
				var range = model[i];
				raiseIf(isNaN(value), "Value #", i, " for element is NaN!");
				value = clamp(+value, range.min, range.max);
				return value;
			});
		}
		this.evaluation = +evaluation;
	},
	
	/** Whether this element is an actual solution or not is decided by `suffices()`. It holds the 
	implementation of the goal test in search problems. More complex criteria may be implemented in 
	`Problem.suffices`. By default it returns false.
	*/
	suffices: function suffices() {
		return this.problem.sufficientElement(this);
	},

	/** The `emblem` of an element is a string that represents it and can be displayed to the user. 
	By default returns the string conversion of the element.
	*/
	emblem: function emblem() {
		return this +'';
	},

	// ## Evaluations ##############################################################################

	/** The element's `evaluation` is calculated by `evaluate()`, which assigns and returns this 
	number. It may return a promise if the evaluation has to be done asynchronously. This can be 
	interpreted as the solution's cost in a search problem or the target function of an optimization 
	problem. The default behaviour is adding up this element's values, useful only for testing.
	*/
	evaluate: function evaluate() {
		var elem = this;
		return Future.then(this.problem.evaluation(this), function (e) {
			elem.evaluation = e;
			return e;
		});
	},
	
	/** The element's `resolution` is the minimal difference between elements' evaluations, below 
	which two evaluations are considered equal.
	*/
	resolution: 1e-15,
	
	/** The [Hamming distance](http://en.wikipedia.org/wiki/Hamming_distance) between two arrays is 
	the number of positions at which corresponding components are different. Arrays are assumed to 
	be of the same length. If they are not, only the common parts are considered.
	*/
	hammingDistance: function hammingDistance(array1, array2) {
		return iterable(array1).zip(array2).filter(function (pair) {
			return pair[0] != pair[1];
		}).count();
	},

	/** The [Manhattan distance](http://en.wikipedia.org/wiki/Manhattan_distance) between two arrays 
	is the sum of the absolute differences of corresponding positions.
	*/
	manhattanDistance: function manhattanDistance(array1, array2) {
		return iterable(array1).zip(array2).map(function (pair) {
			return Math.abs(pair[0] - pair[1]);
		}).sum();
	},

	/** The [euclidean distance](http://en.wikipedia.org/wiki/Euclidean_distance) between two arrays 
	is another option for evaluation.
	*/
	euclideanDistance: function euclideanDistance(array1, array2) {
		return Math.sqrt(iterable(array1).zip(array2).map(function (pair) {
			return Math.pow(pair[0] - pair[1], 2);
		}).sum());
	},

	/** Another common evaluation is the [root mean squared error](http://en.wikipedia.org/wiki/Root_mean_squared_error).
	The method `rootMeanSquaredError` takes a function `f` (usually a mapping of this element) and 
	some `data`. This `data` must be an iterable of arrays, in which the first element is the 
	expected result and the rest are the arguments for the function.
	*/
	rootMeanSquaredError: function rootMeanSquaredError(f, data) {
		var length = 0,
			error = iterable(data).map(function (datum) {
				length++;
				return Math.pow(datum[0] - f.apply(this, datum.slice(1)), 2);
			}).sum();
		return length === 0 ? 0 : Math.sqrt(error / length);
	},

	// ## Expansions ###############################################################################
	
	/** An element's `neighbourhood` is a set of new elements, with values belonging to the n 
	dimensional ball around this element's values with the given `radius` (1% by default). 
	*/
	neighbourhood: function neighbourhood(radius) {
		var elem = this,
			neighbours = [],
			model = this.problem.elementModel();
		this.values.forEach(function (value, i) {
			var range = model[i],
				d = Array.isArray(radius) ? radius[i] : !isNaN(radius) ? radius : range.discrete ? 1 : 0.1,
				v = value + d;
			if (v <= range.max) {
				neighbours.push(elem.modification(i, v));
			}
			v = value - d;
			if (v >= range.min) {
				neighbours.push(elem.modification(i, v));
			}
		});
		return neighbours;
	},
	
	/** The method `modification(index, value, ...)` returns a new and unevaluated copy of this 
	element, with its values modified as specified. Values are always coerced to the [0,1] range.
	*/
	modification: function modification() {
		var newValues = this.values.slice(),
			model = this.problem.elementModel(),
			range, i, v;
		for (i = 0; i < arguments.length; i += 2) {
			v = +arguments[i + 1];
			raiseIf(isNaN(v), "Invalid value ", v, " for element!");
			range = model[i];
			v = clamp(v, range.min, range.max);
			newValues[arguments[i] |0] = v;
		}
		return new this.constructor(this.problem, newValues);
	},
	
	// ## Mappings #################################################################################
	
	/** Gives an alternate representation of this element. See `Problem.mapping()`.
	*/
	mapping: function mapping() {
		return this.problem.mapping(this);
	},
	
	/** A range mapping builds an array of equal length of this element's `values`. Each value is 
	translated from the element model's range to the given range.
	*/
	rangeMapping: function rangeMapping() {
		var args = arguments,
			model = this.problem.elementModel(),
			lastRange = args[args.length - 1];
		raiseIf(args.length < 1, "Element.rangeMapping() expects at least one argument!");
		return this.values.map(function (v, i) {
			var rangeFrom = model[i],
				rangeTo = args.length > i ? args[i] : lastRange;
			v = (v - rangeFrom.min) / (rangeFrom.max - rangeFrom.min) * (rangeTo[1] - rangeTo[0]) + rangeTo[0];
			return clamp(v, rangeTo[0], rangeTo[1]);
		});
	},
	
	/** The `normalizedValues` of an element is a mapping to the range [0,1].
	*/
	normalizedValues: function normalizedValues() {
		return this.rangeMapping([0, 1]);
	},
	
	/** An array mapping builds an array of equal length of this element's `values`. Each value is 
	used to index the corresponding items argument. If there are less arguments than the element's 
	`length`, the last one is used for the rest of the values.
	*/
	arrayMapping: function arrayMapping() {
		var args = arguments,
			lastItems = args[args.length - 1],
			model = this.problem.elementModel();
		raiseIf(args.length < 1, "Element.arrayMapping() expects at least one argument!");
		return this.values.map(function (v, i) {
			var items = args.length > i ? args[i] : lastItems,
				range = model[i],
				index = Math.floor((v - range.min) / (range.max - range.min) * items.length);
			return items[index];
		});
	},
	
	/** A set mapping builds an array of equal length of this element's `values`. Each value is used 
	to select one item. Items are not selected more than once.
	*/
	setMapping: function setMapping(items, full) {
		raiseIf(!Array.isArray(items), "Element.setMapping() expects an array argument!");
		items = items.slice(); // Shallow copy.
		var result = this.normalizedValues().map(function (v, i) {
				raiseIf(items.length < 1, "Element.setMapping(): insufficient elements!");
				var index = clamp(Math.floor(v * items.length), 0, items.length - 1);
				return items.splice(index, 1)[0];
			});
		if (full) {
			raiseIf(items.length != 1, "Element.setMapping(): wrong amount of elements!");
			result.push(items[0]);
		}
		return result;
	},
	
	// ## Other utilities ##########################################################################

	/** A `clone` is a copy of this element.
	*/
	clone: function clone() {
		return new this.constructor(this.problem, this.values, this.evaluation);
	},
	
	/** Two elements can be compared with `equals(other)`. It checks if the other element has the 
	same values and constructor than this one.
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
		return "<"+ (this.constructor.name || 'Element') +" "+ JSON.stringify(this.values) +" "+ this.evaluation +">";
	},
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Element',
		serializer: function serialize_Element(obj) {
			return [obj.problem, obj.values, obj.evaluation];
		}
	}
}); // declare Element.
