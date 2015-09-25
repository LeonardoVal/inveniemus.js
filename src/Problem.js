/**	# Problem

The Problem type represents a search or optimization problem in Inveniemus.
*/
var Problem = exports.Problem = declare({
	/** A problem should have a `title` to be displayed to the user.
	*/
	title: "",
		
	/** A `description` of the problem to be displayed to the user may also be appreciated.
	*/
	description: "",

	/** Many operations in this class require a pseudorandom number generator. By default 
	`base.Randomness.DEFAULT` is used.
	*/
	random: Randomness.DEFAULT,
	
	/** A Problem holds basically three things:	
	*/
	constructor: function Problem(params) {
		initialize(this, params)
			.string('title', { coerce: true, ignore: true })
			.string('description', { coerce: true, ignore: true })
			.object('random', { ignore: true });
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
			});
		return async ? Future.all(elements) : elements.toArray();
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
	It follows the standard protocol of comparison functions; i.e. returns a positive number if 
	`element2` is better than `element1`, a negative number if `element2` is worse then `element1`,
	or zero otherwise. 
	
	Better and worse may mean less or greater evaluation (`minimization`), viceversa 
	(`maximization`) or another criteria altogether. The default implementation is `minimization`.
	*/
	compare: function compare(element1, element2) {
		return this.minimization(element1, element2);
	},
	
	/** A `maximization` compares two elements by evaluation in descending order.
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
		
	/** An `approximation` compares two elements by distance of its evaluation to the given target 
	value in ascending order.
	*/
	approximation: function approximation(target, element1, element2) {
		var d = Math.abs(element1.evaluation - target) - Math.abs(element2.evaluation - target);
		return isNaN(d) ? Infinity : Math.abs(d) < element1.resolution ? 0 : d;
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
