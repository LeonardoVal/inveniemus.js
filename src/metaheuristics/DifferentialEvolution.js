/** # Differential evolution

[Differential evolution](http://en.wikipedia.org/wiki/Differential_evolution) is an evolutionary
metaheuristic based on a particular form of crossover. This operator acts on individual values of
each state, replacing the value with a combination of the corresponding value in three other 
randomly chosen elements.
*/
var DifferentialEvolution = metaheuristics.DifferentialEvolution = declare(Metaheuristic, {
	/** The constructor takes the following parameters:
	*/
	constructor: function DifferentialEvolution(params) {
		Metaheuristic.call(this, params);
		initialize(this, params)
			/** + `differentialWeight=1` is the coefficient (usually named `F`) in the crossover 
			formula.
			*/
			.number('differentialWeight', { coerce: true, defaultValue: 1, minimum: 0, maximum: 2 })
			/** + `crossoverProbability=30%` is the probability of getting a value from a crossover. 
			*/
			.number('crossoverProbability', { coerce: true, defaultValue: 0.3, minimum: 0, maximum: 1 })
			/** Also, the state's size is constrained to a minimum of 4, because of how the 
			crossover works.
			*/
			.integer('size', { coerce: true, defaultValue: 100, minimum: 4 });
	},
	
	/** The expansion is quite simple. For each element `x` in the state a new one is generated. 
	Three other elements are randomly selected from the state, named `a`, `b` and `c`. With a 
	probability of `crossoverProbability`, the ith value of the new element results from 
	`a[i] + F(b[i] - c[i])`, where `F` is the `differentialWeight`. The other values are copied from 
	`x`, although it is assured that at least one of the new element's is calculated as shown 
	before. 
	*/
	expansion: function expansion() {
		var mh = this,
			result = this.state.map(function (element, elementIndex) {
				var crossover = mh.random.choices(3, iterable(mh.state).filter(function (e, i) {
						return i !== elementIndex;
					})),
					a = crossover[0].values,
					b = crossover[1].values,
					c = crossover[2].values,
					randomIndex = mh.random.randomInt(element.length),
					newValues = [];
				for (var i = 0; i < element.length; ++i) {
					newValues.push(i === randomIndex || mh.random.randomBool(mh.crossoverProbability) ?
						a[i] + mh.differentialWeight * (b[i] - c[i]) :
						element.values[i]);
				}
				return new element.constructor(newValues);
			});
		this.onExpand();
		return result;
	},
	
	toString: function toString() {
		return (this.constructor.name || 'DifferentialEvolution') +'('+ JSON.stringify(this) +')';
	}
}); // declare DifferentialEvolution.
