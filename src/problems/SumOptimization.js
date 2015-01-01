/** # Sum optimization problem

A class of very simple problems that deal with optimizing the sum of the elements' values. Probably 
the simplest optimization problem that can be defined, included here for testing purposes.
*/
problems.SumOptimization = declare(Problem, {
	title: "Sum optimization",
	description: "Very simple problem based on optimizing the elements' values sum.",

	/** This very simple problem is based on optimizing the elements' values sum. The `target` 
	number determines which way the optimization goes.
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
	
	/** A state `suffices(elements)` when the best element's values add up to the target value.
	*/
	suffices: function suffices(elements) {
		return iterable(elements[0].values).sum() === this.target;
	},
	
	/** The comparison between elements depends on this problem's target. For a `Infinity` 
	maximization is applied, for `-Infinity` minimization, and for every other number approximation.
	*/
	compare: function compare(element1, element2) {
		return this.target === -Infinity ? this.minimization(element1, element2)
			: this.target === Infinity ? this.maximization(element1, element2)
			: this.approximation(this.target, element1, element2);
	}
}); // declare SumOptimization.
