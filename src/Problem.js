/** inveniemus/src/Problem.js
	The Problem type represents a search or optimization problem in the 
	Inveniemus library.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
var Problem = exports.Problem = basis.declare({
	/** Problem.title='<no title>':
		Title of the problem to be displayed to the user.
	*/
	title: "<no title>",
		
	/** Problem.description='<no description>':
		Description of the problem to be displayed to the user.
	*/
	description: "<no description>",

	/** Problem.random=Randomness.DEFAULT:
		Pseudorandom number generator used by the problem.
	*/
	random: __DEFAULT_RANDOM__,
	
	/** Problem.representation=Element:
		Element constructor used for this problem's candidate solutions.
	*/
	representation: Element,
	
	/** new Problem(params):
		A search/optimization problem definition, holding the representation of
		the elements (as an Element constructor).
	*/
	constructor: function Problem(params) {
		basis.initialize(this, params)
			.string('title', { coerce: true, ignore: true })
			.string('description', { coerce: true, ignore: true })
			.object('random', { ignore: true })
		// Overrides.
			.func('representation', { ignore: true })
			.func('compare', { ignore: true })
			.func('suffices', { ignore: true });
	},
		
	/** Problem.compare(element1, element2):
		Standard comparison function between two elements. Returns a positive
		number if element1 is better than element2, a negative number if 
		element1 is worse then element2, or zero otherwise.
		Implements a minimization by default.
	*/
	compare: function compare(element1, element2) {
		return this.minimization(element1, element2);
	},
		
	/** Problem.suffices(elements):
		Returns true if inside the elements array there is an actual solution to
		the problem. It holds the implementation of the goal test in search 
		problems. 
		By default checks if the first element by calling its suffice method.
	*/
	suffices: function suffices(elements) {
		return elements[0].suffices();
	},
	
	// Optimization modes. /////////////////////////////////////////////////////
		
	/** Problem.maximization(element1, element2):
		Compares two elements by evaluation in descending order.
	*/
	maximization: function maximization(element1, element2) {
		var d = element2.evaluation - element1.evaluation;
		return isNaN(d) ? -Infinity : Math.abs(d) < element1.resolution ? 0 : d;
	},
	
	/** Problem.minimization(element1, element2):
		Compares two elements by evaluation in ascending order.
	*/
	minimization: function minimization(element1, element2) {
		var d = element1.evaluation - element2.evaluation;
		return isNaN(d) ? Infinity : Math.abs(d) < element1.resolution ? 0 : d;
	},
		
	/** Problem.approximation(target, element1, element2):
		Compares two elements by distance of its evaluation to the given target
		value in ascending order.
	*/
	approximation: function approximation(target, element1, element2) {
		var d = Math.abs(element1.evaluation - target) - Math.abs(element2.evaluation - target);
		return isNaN(d) ? Infinity : Math.abs(d) < element1.resolution ? 0 : d;
	},
		
	// Utility methods. ////////////////////////////////////////////////////////
		
	toString: function toString() {
		return (this.constructor.name || 'Problem') +"("+ JSON.stringify(this) +")";
	}
}); // declare Problem.
		
/** problems:
	Bundle of classic and reference problems.
*/
var problems = exports.problems = {};
