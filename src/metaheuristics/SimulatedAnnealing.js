/** # Simulated annealing

[Simulated annealing](http://en.wikipedia.org/wiki/Simulated_annealing) is a stochastic global 
optimization technique.
*/
var SimulatedAnnealing = metaheuristics.SimulatedAnnealing = declare(Metaheuristic, {
	/** The constructor takes some specific parameters for this search:
	*/
	constructor: function SimulatedAnnealing(params) {
		Metaheuristic.call(this, params);
		initialize(this, params)
		/** + `maximumTemperature=1` is the temperature at the start of the run.
		*/
			.number('maximumTemperature', { defaultValue: 1, coerce: true })
		/** + `minimumTemperature=0` is the temperature at the end of the run.
		*/
			.number('minimumTemperature', { defaultValue: 0, coerce: true })
		/** + `delta=1` is the radius of the elements surroundings in every dimension, that is 
		checked by this algorithm.
		*/
			.number('delta', { defaultValue: 1, coerce: true })
		/** + `size=1` is 1 by default, but larger states are supported.
		*/
			.integer('size', { defaultValue: 1,	coerce: true })
		/** + `temperature=coolingSchedule.linear` is the temperature function.
		*/
			.func('temperature', { defaultValue: this.coolingSchedule.linear });
	},
	
	/** `randomNeighbour(element, radius=this.delta)` returns one neighbour of the given element 
	chosen at random.
	*/
	randomNeighbour: function randomNeighbour(element, radius) {
		radius = isNaN(radius) ? this.delta : +radius;
		var i = this.random.randomInt(element.values.length), 
			v = element.values[i];
		return element.modification(i, this.random.randomBool() ? v + radius : v - radius);
	},
	
	/** The `acceptance(current, neighbour, temp=this.temperature())` is the probability of 
	accepting the new element. Uses the original definitions from 
	[Kirkpatrick's paper](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.123.7607).
	*/
	acceptance: function acceptance(current, neighbour, temp) {
		temp = isNaN(temp) ? this.temperature() : +temp;
		if (neighbour.isBetterThan(current)) {
			return 1; // Should always accept a better neighbour.
		} else {
			var d = -Math.abs(neighbour.evaluation - current.evaluation);
			return clamp(Math.exp(d / temp), 0, 1);
		}
	},
	
	/** The annealings temperature is a metaphore for the amount of randomness the process applies. 
	The cooling schedule is a function that calculates the temperature for any given step in the
	optimization.
	*/
	coolingSchedule: {
		linear: function temperature() {
			return (1 - Math.max(0, this.step) / this.steps) * 
				(this.maximumTemperature - this.minimumTemperature) + this.minimumTemperature;
		}
	},
	
	/** At every iteration, for each element in the state one of its neighbours is chosen randomly. 
	If the neighbour is better, it replaces the corresponding element. Else it may still do so, but 
	with a probability calculated by `acceptance()`.
	*/
	update: function update() {
		var mh = this,
			temp = this.temperature(),
			acceptanceStat = this.statistics.stat({key: 'acceptance'}),
			temperatureStat = this.statistics.stat({key: 'temperature'});
		temperatureStat.add(temp, this.step);
		return Future.all(this.state.map(function (elem) {
			var neighbour = mh.randomNeighbour(elem);
			return Future.then(neighbour.evaluate(), function () {
				var p = mh.acceptance(elem, neighbour, temp);
				acceptanceStat.add(p, neighbour);
				return mh.random.randomBool(p) ? neighbour : elem;
			});
		})).then(function (elems) {
			elems = mh.sort(elems);
			mh.state = elems;
			mh.onUpdate();
			return mh;
		});
	},

	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'SimulatedAnnealing',
		serializer: function serialize_SimulatedAnnealing(obj) {
			//TODO Serialize 'temperature'
			return [obj.__params__('maximumTemperature', 'minimumTemperature', 'delta')];
		}
	}
}); // declare SimulatedAnnealing.
