/**	# Problem

The Problem type represents a search or optimization problem in Inveniemus.
*/
var Problem = exports.Problem = declare({
	/** The problem constructor takes the following parameters:	
	*/
	constructor: function Problem(params) {
		params = params || {};
		initialize(this, params)
			/** + A `title` to be displayed to the user.
			*/
			.string('title', { coerce: true, defaultValue: this.constructor.name || "" })
			/** + A `description` of the problem to be displayed to the user may also be appreciated.
			*/
			.string('description', { coerce: true, defaultValue: "" })
			/** + A `random` number generator, required by many operations. By default 
				`base.Randomness.DEFAULT` is used.
			*/
			.object('random', { defaultValue: Randomness.DEFAULT });
		/** + One or more `objectives`, which defines the mode of optimization. It may be either a
			number or array of numbers, where `-Infinity` means minimization (the default),
			`+Infinity` means maximization and a number means approximation to that value.
		*/
		var objectives = params.hasOwnProperty('objectives') ? params.objectives : -Infinity;
		if (typeof params.objectives === 'number' && !isNaN(params.objectives)) {
			this.objectives = [params.objectives];
		} else if (Array.isArray(params.objectives)) {
			this.objectives = params.objectives;
		} else {
			this.objectives = [-Infinity]; // Minimization is the default.
		}
	},

	/** The `elementModel` is an array of ranges, each an array of two numbers defining the minimum
	an maximum possible value of each position of every element in this problem. All elements should
	also be of the same length as the model.
	
	By default, the method returns the `__elementModel__` property. It is inefficiency to recompute 
	this result every time, since it is required in many places.
	*/
	__elementModel__: Iterable.repeat({ min: 0, max: 1, discrete: false }, 10).toArray(),
	
	elementModel: function elementModel() {
		return this.__elementModel__;
	},
	
	/** Problem uses `Element` instances to represent its candidate solutions.
	*/
	newElement: function newElement(values, evaluation) {
		return new Element(this, values, evaluation);
	},
	
	/** The problem's elements must be evaluated somehow. This can be interpreted as the solution's 
	cost in a search problem or the target function of an optimization problem. The default 
	behaviour is adding up this element's values, useful only for testing. It can return a future 
	if the evaluation has to be done asynchronously. 
	*/
	evaluation: function evaluation(element) {
		return iterable(element.values).sum();
	},
	
	/** The `evaluate` method is used to assign an evaluation to all the given `elements`. By 
	default it iterates over all elements and gets their evaluation using the `evaluation` method. 
	If `reevaluate` is false (the default), already evaluated elements are ignored. This method may 
	be overriden to make a relative evaluation scheme (e.g. in coevolution).
	*/
	evaluate: function evaluate(elements, reevaluate) {
		var async = false;
		elements = iterable(elements).filter(
			function (element) {
				return reevaluate || isNaN(element.evaluation);
			},
			function (element) { // ... evaluate them.
				var result = element.evaluate();
				async = async || Future.__isFuture__(result);
				return result;
			}).toArray();
		return async ? Future.all(elements) : elements;
	},
	
	/** Usually a numbers array is just too abstract to handle, and	another representation of the 
	candidate solution must be build. For this `mapping()` must be overridden to returns an 
	alternate representation of an element that may be fitter for evaluation or showing it to the
	user. By default it just returns the same `values` array.
	*/
	mapping: function mapping(element) {
		return element.values;
	},
	
	/** An element is `sufficient` when it can be considered a solution of a search or a good enough
	solution of an optimization. By default it returns false.
	*/
	sufficientElement: function sufficientElement(element) {
		return false;
	},
	
	/** When a set of elements is sufficient, the search/optimization ends. The method 
	`suffices(elements)` returns `true` if inside the elements array there are enough actual 
	solutions to this problem. It holds the implementation of the goal test in search problems. By 
	default calls the `suffice` method of the first element (assumed to be the best one).
	*/
	sufficientElements: function sufficientElements(elements) {
		return this.sufficientElement(elements[0]);
	},
	
	// ## Optimization modes #######################################################################
	
	/** How elements are compared with each other in the problem determines which kind of 
	optimization is performed. The `compare` method implements the comparison between two elements. 
	It returns a positive number if `element2` is better than `element1`, a negative number if 
	`element2` is worse then `element1`, or zero otherwise. Better and worse may mean less or 
	greater evaluation (`minimization`), viceversa (`maximization`) or another criteria altogether.
	*/
	compare: function compare(element1, element2) {
		if (this.objectives.length === 1) {
			return this.singleObjectiveComparison(this.objectives[0], element1.evaluation, element2.evaluation);
		} else {
			return this.paretoComparison(this.objectives, element1.evaluation, element2.evaluation);
		}
	},
	
	/** A single objective optimization has three modes, given by the `objective` parameter: 
	*/
	singleObjectiveComparison: function singleObjectiveComparison(objective, value1, value2) {
		var d;
		switch (objective) {
			/** + `-Infinity` means minimization. */
			case -Infinity: {
				d = value2 - value1;
				return isNaN(d) ? Infinity : d;
			}
			/** + `+Infinity` means maximization. */
			case +Infinity: {
				d = value1 - value2;
				return isNaN(d) ? -Infinity : d;
			}
			/** + An actual number means approximation to said value. */ 
			default: {
				d = Math.abs(value2 - objective) - Math.abs(value1 - objective);
				return isNaN(d) ? Infinity : d;
			}
		}
	},
	
	/** The [Pareto efficiency](https://en.wikipedia.org/wiki/Pareto_efficiency) is frequently used 
	in multiobjective optimizations, yet it is not a complete order. The `paretoComparison` method 
	takes an array of `objectives`, and two arrays of numbers to be compared. The result is an array 
	of comparisons (-1, 0 or 1) with a `domination` property. If `domination` is:
	
	+ `< 0`: `element2` dominates `element1`.
	
	+ `> 0`: `element1` dominates `element2`.
	
	+ `= 0`: both elements are equally evaluated.
	
	+ `NaN`: elements could not be compared (i.e. their evaluations are different, but they do not 
		dominate each other).
	*/
	paretoComparison: function paretoComparison(objectives, values1, values2) {
		var worse = 0, better = 0,
			problem = this,
			result;
		raiseIf(objectives.length !== values1.length, "Expected ", objectives.length, " evaluations, but got ", values1.length, "!");
		raiseIf(objectives.length !== values2.length, "Expected ", objectives.length, " evaluations, but got ", values2.length, "!");
		result = Iterable.zip(objectives, values1, values2).mapApply(function (objective, value1, value2) {
			var r = problem.singleObjectiveComparison(objective, value1, value2);
			if (r < 0) {
				worse++;
			} else if (r > 0) {
				better++;
			}
			return r;
		}).toArray();
		result.domination = worse === 0 ? better : better === 0 ? -worse : NaN;
		return result;
	},
	
	// ## Utilities ################################################################################
	
	/** The default string representation of a Problem instance has this shape: 
	`"Problem(params)"`.
	*/
	toString: function toString() {
		return "<"+ (this.constructor.name || 'Problem') +" "+ JSON.stringify(this.title) +">";
	},
	
	/** Returns a reconstruction of the parameters used in the construction of this instance.
	*/
	__params__: function __params__() {
		var params = {},
			self = this,
			ids = ['title', 'description'].concat(Array.prototype.slice.call(arguments));
		ids.forEach(function (id) {
			if (self.hasOwnProperty(id)) {
				params[id] = self[id];
			}
		});
		if (this.random !== Randomness.DEFAULT) {
			params.random = this.random;
		}
		return params;
	},
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Problem',
		serializer: function serialize_Problem(obj) {
			return [obj.__params__()];
		}
	}
}); // declare Problem.
