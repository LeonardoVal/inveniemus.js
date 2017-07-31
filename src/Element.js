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
	constructor: function Element(values, evaluation) {
		this.__values__ = !values ? this.randomValues() : this.checkValues(values, false);
		this.evaluation = Array.isArray(evaluation) ? evaluation :
			isNaN(evaluation) || evaluation === null ? null : [+evaluation];
	},

	/** It is usually more convenient to have the `values` in an instance of `Array` than an
	instance of `Uint32Array` (e.g. when using ).
	*/
	values: function values() {
		return Array.prototype.slice.call(this.__values__);
	},

	/** The default element `model` defines 10 dimensions with 2^32 values. Please override.
	*/
	model: Iterable.repeat({ n: Math.pow(2,32) }, 10).toArray(),

	/** Random values are integers within the range defined by the element's model.
	*/
	randomValue: function randomValue(i) {
		return this.problem.random.randomInt(0, this.model[i].n) |0;
	},

	randomValues: function randomValues() {
		var random = this.problem.random;
		return new Uint32Array(this.model.map(function (model) {
			return random.randomInt(0, model.n) |0;
		}));
	},

	/** Checks if all given `values` are within the range defined by this element's model. If
	`coerce` is false any invalid values raises an error. Else values are coerced to fit the
	element's model.
	*/
	checkValues: function checkValues(values, coerce) {
		return new Uint32Array(this.model.map(function (model, i) {
			var v = values[i],
				n = model.n;
			if (isNaN(v)) {
				raiseIf(!coerce, "Value #", i, " (", v, ") is NaN!");
				return 0;
			}
			if (v < 0 || v >= n) {
				raiseIf(!coerce, "Value #", i, " (", v, ") is out of range [0,", n-1, "]!");
				return v < 0 ? 0 : n - 1;
			}
			return v;
		}));
	},

	/** Whether this element is an actual solution or not is decided by `suffices()`, which is
	delegated to `Problem.sufficientElement` by default.
	*/
	suffices: function suffices() {
		return this.problem.sufficientElement(this);
	},

	/** The `emblem` of an element is a string that represents it and can be displayed to the user.
	By default returns a custom string representation.
	*/
	emblem: function emblem() {
		var values = this.values().map(function (v) {
				return v.toString(16);
			}).join('|'),
			evaluation = this.evaluation ? this.evaluation.map(function (v) {
				return v.toString(16);
			}).join('|') : '!';
		return '[Element '+ values +' '+ evaluation +']';
	},

	// ## Evaluations ##############################################################################

	/** The element's `evaluation` is calculated by `evaluate()`, which assigns and returns this
	array of numbers. It may return a promise if the evaluation has to be done asynchronously. This
	can be interpreted as the solution's cost in a search problem or the target function of an
	optimization problem. The default behaviour is adding up this element's values, useful only for
	testing.
	*/
	evaluate: function evaluate() {
		var elem = this;
		return Future.then(this.problem.evaluation(this), function (e) {
			elem.evaluation = Array.isArray(e) ? e : isNaN(e) ? null : [+e];
			raiseIf(elem.evaluation === null, 'The evaluation of ', elem, ' is null!');
			return elem.evaluation;
		});
	},

	/** The [Hamming distance](http://en.wikipedia.org/wiki/Hamming_distance) between two arrays is
	the number of positions at which corresponding components are different. Arrays are assumed to
	be of the same length. If they are not, only the common parts are considered.
	*/
	hammingDistance: function hammingDistance(array1, array2) {
		var count = 0;
		for (var i = 0, len = Math.min(array1.length, array2.length); i < len; i++) {
			if (array1[i] !== array2[i]) {
				count++;
			}
		}
		return count;
	},

	/** The [Manhattan distance](http://en.wikipedia.org/wiki/Manhattan_distance) between two
	arrays is the sum of the absolute differences of corresponding positions.
	*/
	manhattanDistance: function manhattanDistance(array1, array2) {
		var sum = 0;
		for (var i = 0, len = Math.min(array1.length, array2.length); i < len; i++) {
			sum += Math.abs(array1[i] - array2[i]);
		}
		return sum;
	},

	/** The [euclidean distance](http://en.wikipedia.org/wiki/Euclidean_distance) between two
	arrays is another option for evaluation.
	*/
	euclideanDistance: function euclideanDistance(array1, array2) {
		var sum = 0;
		for (var i = 0, len = Math.min(array1.length, array2.length); i < len; i++) {
			sum += Math.pow(array1[i] - array2[i], 2);
		}
		return Math.sqrt(sum);
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

	/** Finding out if this element is better than other uses the problem's `compare` method.
	*/
	isBetterThan: function isBetterThan(other) {
		return this.problem.compare(this, other) > 0;
	},

	// ## Expansions ###############################################################################

	/** An element's `neighbourhood` is a set of new elements, with values belonging to the n
	dimensional ball around this element's values with the given `radius` (1 by default).
	*/
	neighbourhood: function neighbourhood(radius) {
		var neighbours = [],
			model = this.model,
			values = this.__values__,
			d = Math.abs(Array.isArray(radius) ? radius[i] : radius),
			n, value;
		if (isNaN(d)) {
			d = 1;
		}
		for (var i = 0, len = values.length; i < len; i++) {
			value = values[i];
			n = model[i].n;
			if (value > 0) {
				neighbours.push(this.modification(i, Math.max(0, value - d)));
			}
			if (value < n - 1) {
				neighbours.push(this.modification(i, Math.min(n - 1, value + d)));
			}
		}
		return neighbours;
	},

	/** The method `modification(index, value, ...)` returns a new and unevaluated copy of this
	element, with its values modified as specified. Values are always coerced to the element's
	model.
	*/
	modification: function modification() {
		var newValues = this.__values__.slice(),
			pos;
		for (var i = 0; i < arguments.length; i += 2) {
			pos = arguments[i] |0;
			newValues[pos] = clamp(arguments[i + 1], 0, this.model[i].n - 1);
		}
		return new this.constructor(newValues);
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
			model = this.model,
			lastRange = args[args.length - 1];
		raiseIf(args.length < 1, "Element.rangeMapping() expects at least one argument!");
		return Array.prototype.map.call(this.__values__, function (v, i) {
			var n = model[i].n,
				rangeTo = args.length > i ? args[i] : lastRange;
			v = v / n * (rangeTo[1] - rangeTo[0]) + rangeTo[0];
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
			model = this.model;
		raiseIf(args.length < 1, "Element.arrayMapping() expects at least one argument!");
		return Array.prototype.map.call(this.__values__, function (v, i) {
			var items = args.length > i ? args[i] : lastItems,
				n = model[i].n,
				index = Math.floor(v / n * items.length);
			return items[index];
		});
	},

	/** A set mapping builds an array of equal length of this element's `values`. Each value is
	used to select one item. Items are not selected more than once.
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
		return new this.constructor(this.__values__, this.evaluation);
	},

	/** Two elements can be compared with `equals(other)`. It checks if the other element has the
	same values and constructor than this one.
	*/
	equals: function equals(other) {
		if (this.constructor === other.constructor &&
				this.__values__.length === other.__values__.length) {
			for (var i = 0, len = this.__values__.length; i < len; i++) {
				if (this.__values__[i] !== other.__values__[i]) {
					return false;
				}
			}
			return true;
		}
		return false;
	},

	/** The default string representation of an Element is its Sermat serialization.
	*/
	toString: function toString() {
		return Sermat.ser(this);
	},

	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Element',
		serializer: function serialize_Element(obj) {
			return [obj.problem, obj.values(), obj.evaluation];
		},
		materializer: function materialize_Element(obj, args) {
			return !args ? null : new args[0].Element(args[1], args[2]);
		}
	}
}); // declare Element.
