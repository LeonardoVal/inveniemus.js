/** inveniemus/src/Element.js
	Element is the term used in the Inveniemus library for representations of
	candidate solutions in a search or optimization problem.
	See <http://en.wikipedia.org/wiki/Metaheuristic>.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
var __DEFAULT_RANDOM__ = basis.Randomness.DEFAULT,
	iterable = basis.iterable;

// Element base constructor. ///////////////////////////////////////////////////

var Element = exports.Element = basis.declare({
	/** Element.length=10:
		Size of the element's values array.
	*/
	length: 10,

	/** Element.minimumValue=0:
		Minimum value a number in this element can have.
	*/
	minimumValue: 0,
	
	/** Element.maximumValue=1:
		Maximum value a number in this element can have.
	*/
	maximumValue: 1,
	
	/** Element.random=Randomness.DEFAULT:
		Pseudorandom number generator used by the element.
	*/
	random: __DEFAULT_RANDOM__,
	
	/** new Element(values=<random values>, evaluation=NaN):
		An element represents a candidate solution. It is defined by the values
		array of numbers, between minimumValue and maximumValue (by default 0 
		and 1).
	*/
	constructor: function Element(values, evaluation) {
		if (typeof values === 'undefined') {
			values = this.randomValues();
		}
		/** Element.values:
			An array of numbers that represents a candidate solution.
		*/
		this.values = values.slice(); // Makes a shallow copy.
		/** Element.evaluation=NaN:
			The element's evaluation is a measure of its fitness to solve a
			problem. It guides almost all of the metaheuristics.
		*/
		this.evaluation = +evaluation;
	},

	/** Element.randomValue():
		Returns a random value between this.minimumValue and this.maximumValue.
	*/
	randomValue: function randomValue() {
		return this.random.random(this.minimumValue, this.maximumValue);
	},
	
	/** Element.randomValues():
		Returns an array with random numbers.
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
	
	/** Element.evaluate():
		Evaluates this element, assigning its evaluation and returning it. It 
		can return a Future if the evaluation has to be done asynchronously. 
		This can be interpreted as the solutions cost in a search problem or the
		target function of an optimization problem. The default behaviour is 
		adding up this element's values, useful only for testing.
	*/
	evaluate: function evaluate() {
		return this.evaluation = iterable(this.values).sum();
	},

	/** Element.suffices():
		Returns true if this element is an actual solution to the problem. It 
		holds the implementation of the goal test in search problems. More 
		complex criteria may be implemented in Problem.suffices.
		By default it checks if the values add up to zero.
	*/
	suffices: function suffices() {
		return iterable(this.values).sum() === 0;
	},
	
	/** Element.mapping():
		Returns an alternate representation of this element that may be fitter
		for evaluation or showing it to the user. By default it just returns the 
		values array.
	*/
	mapping: function mapping() {
		return this.values;
	},

	/** Element.emblem():
		The emblem of an element is a string that represents it and can	be 
		displayed to the user. By default returns the string conversion.
	*/
	emblem: function emblem() {
		return JSON.stringify(this.mapping());
	},

	// Evaluation utilities. ///////////////////////////////////////////////////

	/** Element.resolution=Number.EPSILON:
		Minimum difference between two evaluation to consider them different.
	*/
	resolution: Number.EPSILON || 2.220446049250313e-16,
	
	/** Element.hammingDistance(array1, array2):
		The Hamming distance between two arrays is the number of positions at 
		which corresponding components are different. Arrays are assumed to be
		of the same length. If they are not, only the common parts are 
		considered.
		See <http://en.wikipedia.org/wiki/Hamming_distance>.
	*/
	hammingDistance: function hammingDistance(array1, array2) {
		return iterable(array1).zip(array2).filter(function (pair) {
			return pair[0] != pair[1];
		}).count();
	},

	/** Element.manhattanDistance(array1, array2):
		The Manhattan distance between two arrays is the sum of the absolute 
		differences of corresponding positions. Arrays are assumed to be of the 
		same length. If they are not, only the common parts are considered.
		See <http://en.wikipedia.org/wiki/Manhattan_distance>.
	*/
	manhattanDistance: function manhattanDistance(array1, array2) {
		return iterable(array1).zip(array2).map(function (pair) {
			return Math.abs(pair[0] - pair[1]);
		}).sum();
	},

	/** Element.euclideanDistance(array1, array2):
		Calculates the euclidean distance between two arrays. Arrays are assumed
		to be of the same length. If they are not, only the common parts are 
		considered.
		See <http://en.wikipedia.org/wiki/Euclidean_distance>.
	*/
	euclideanDistance: function euclideanDistance(array1, array2) {
		return Math.sqrt(iterable(array1).zip(array2).map(function (pair) {
			return Math.pow(pair[0] - pair[1], 2);
		}).sum());
	},

	/** Element.rootMeanSquaredError(f, data):
		Returns the root mean squared error of the function f on the given 
		data. The data must be an iterable of arrays, in which the first element 
		is the expected result and the rest are the arguments for the function.
		See <http://en.wikipedia.org/wiki/Root_mean_squared_error>.
	*/
	rootMeanSquaredError: function rootMeanSquaredError(f, data) {
		var length = 0,
			error = iterable(data).map(function (datum) {
				length++;
				return Math.pow(datum[0] - f.apply(this, datum.slice(1)), 2);
			}).sum()
		return length == 0 ? 0 : Math.sqrt(error / length);
	},

	// Expansion utilities. ////////////////////////////////////////////////////
	
	/** Element.neighbourhood(delta=0.01):
		Returns an array of new elements, with values belonging to the n 
		dimensional ball around this element's values. 
	*/
	neighbourhood: function neighbourhood(delta) {
		delta = isNaN(delta) ? 0.01 : +delta;
		var elems = [], 
			values = this.values,
			i, value;
		for (i = 0; i < values.length; i++) {
			value = values[i] + delta;
			if (value <= this.maximumValue) {
				elems.push(this.modification(i, value));
			}
			value = values[i] - delta;
			if (value >= this.minimumValue) {
				elems.push(this.modification(i, value));
			}
		}
		console.log(delta);//FIXME
		console.log(elems);//FIXME
		return elems;
	},
	
	/** Element.modification(index, value, ...):
		Returns a new and unevaluated copy of this element, with its values
		modified as specified.
	*/
	modification: function modification() {
		var copy = new this.constructor(this.values), i, v;
		for (i = 0; i < arguments.length; i += 2) {
			v = +arguments[i + 1];
			basis.raiseIf(isNaN(v) || v < this.minimumValue || v > this.maximumValue, "Invalid value ", v, " for element.");
			copy.values[arguments[i] | 0] = +arguments[i + 1];
		}
		return copy;
	},
	
	// Mapping utilities. //////////////////////////////////////////////////////
	
	/** Element.arrayMapping(items...):
		Builds an array of equal length of this element's values. Each value is
		used to index the corresponding items argument. If there are less 
		arguments than the element's length, the last one is used for the rest
		of the values.
	*/
	arrayMapping: function arrayMapping() {
		var args = arguments, 
			lastItems = args[args.length - 1];
		basis.raiseIf(args.length < 1, "Element.linearMapping() expects at least one argument.");
		return this.values.map(function (v, i) {
			var items = args.length > i ? args[i] : lastItems;
			return items[v * items.length | 0];
		});
	},
	
	/** Element.setMapping(items):
		Builds an array of equal length of this element's values. Each value is
		used to select one item. Items are not selected more than once. 
	*/
	setMapping: function setMapping(items) {
		basis.raiseIf(!Array.isArray(items), "Element.setMapping() expects an array argument.");
		items = items.slice(); // Shallow copy.
		return this.values.map(function (v, i) {
			return items.splice(v * items.length | 0, 1)[0];
		});
	},
	
	// Utility methods. ////////////////////////////////////////////////////////

	/** Element.clone():
		Returns a copy of this element.
	*/
	clone: function clone() {
		return new this.constructor(this.values, this.evaluation);
	},
	
	/** Element.equals(other):
		Checks if the other element has the same values and constructor than 
		this one.
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
	
	toString: function toString() {
		return (this.constructor.name || 'Element') +"("+ JSON.stringify(this.values) +", "+ this.evaluation +")";
	}
}); // declare Element.
