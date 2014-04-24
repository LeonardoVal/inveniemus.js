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
