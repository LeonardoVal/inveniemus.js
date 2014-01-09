/** [Simulated annealing](http://en.wikipedia.org/wiki/Simulated_annealing) 
	implementation for the Inveniemus library.
*/
var SimulatedAnnealing = metaheuristics.SimulatedAnnealing = basis.declare(Metaheuristic, {
	/** new SimulatedAnnealing(params):
		Builds a simulated annealing search.
		See <http://en.wikipedia.org/wiki/Simulated_annealing>.
	*/
	constructor: function SimulatedAnnealing(params) {
		Metaheuristic.call(this, params);
		basis.initialize(this, params)
		/** SimulatedAnnealing.maximumTemperature=1:
			The temperature at the start of the run.
		*/
			.number('maximumTemperature', { defaultValue: 1, coerce: true })
		/** SimulatedAnnealing.minimumTemperature=1:
			The temperature at the end of the run.
		*/
			.number('minimumTemperature', { defaultValue: 0, coerce: true })
		/** SimulatedAnnealing.delta=0.01:
			The radius of the elements surroundings in every dimension, that is
			checked by this algorithm.
		*/
			.number('delta', { defaultValue: 0.01, coerce: true })
		/** SimulatedAnnealing.size=1:
			Default value for size is 1.
		*/
			.integer('size', { defaultValue: 1,	coerce: true });
	},
	
	/** SimulatedAnnealing.randomNeighbour(element, radius=this.delta):
		Returns one neighbour of the given element chosen at random.
	*/
	randomNeighbour: function randomNeighbour(element, radius) {
		radius = isNaN(radius) ? this.delta : +radius;
		var i = this.random.randomInt(element.values.length), 
			v = element.values[i];
		if (this.random.randomBool()) {
			v = Math.min(element.maximumValue, v + radius);
		} else {
			v = Math.max(element.minimumValue, v - radius);
		}
		return element.modification(i, v);
	},
	
	/** SimulatedAnnealing.acceptance(current, neighbour, temp=this.temperature()):
		Returns the probability of accepting the new element. Uses the original
		definitions from Kirkpatrick's paper.
	*/
	acceptance: function acceptance(current, neighbour, temp) {
		temp = isNaN(temp) ? this.temperature() : +temp;
		if (this.problem.compare(current, neighbour) > 0) {
			return 1; // Should always accept a better neighbour.
		} else {
			var d = -Math.abs(neighbour.evaluation - current.evaluation);
			return Math.min(1, Math.exp(d / temp));
		}
	},
	
	/** SimulatedAnnealing.temperature():
		Returns the current temperature of the annealing.
	*/
	temperature: function temperature() {
		return (1 - Math.max(0, this.step) / this.steps) * (this.maximumTemperature - this.minimumTemperature) + this.minimumTemperature;
	},
	
	/** SimulatedAnnealing.update():
		For each element in the state one of its neighbours is chosen randomly. If
		the neighbour is better, it replaces the corresponding element. Else it
		may still do so, but with a probability calculated by this.acceptance().
	*/
	update: function update() {
		var mh = this,
			temp = this.temperature(),
			acceptanceStat = this.statistics.stat(['acceptance']),
			temperatureStat = this.statistics.stat(['temperature']);
		temperatureStat.add(temp, this.step);
		return basis.Future.all(this.state.map(function (elem) {
			var neighbour = mh.randomNeighbour(elem);
			return basis.when(neighbour.evaluate()).then(function () {
				var p = mh.acceptance(elem, neighbour, temp);
				acceptanceStat.add(p, neighbour);
				if (mh.random.randomBool(p)) {
					return neighbour;
				} else {
					return elem;
				}
			});
		})).then(function (elems) {
			return mh.state = elems;
		});
	},

	// Utility methods. ////////////////////////////////////////////////////////
		
	toString: function toString() {
		return (this.constructor.name || 'SimulatedAnnealing') +'('+ JSON.stringify(this) +')';
	}
}); // declare SimulatedAnnealing.
