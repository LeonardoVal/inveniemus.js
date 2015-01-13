/** # Hill climbing

[Hill Climbing](http://en.wikipedia.org/wiki/Hill_climbing) is a simple iterative local search 
method. The state has only one element, and in each iteration its best successor replaces it, after
a local optimum is reached.
*/
var HillClimbing = metaheuristics.HillClimbing = declare(Metaheuristic, {
	/** The constructor takes an extra `delta=0.01` parameter. This is the radius of the elements 
	surroundings in every dimension, that is checked by this algorithm.
	*/
	constructor: function HillClimbing(params) {
		Metaheuristic.call(this, params);
		initialize(this, params)
			.number('delta', { defaultValue: 0.01, coerce: true })
		/** Also, the state's size is constrained to 1 by default. This may be increased, resulting 
		in many parallel climbings.
		*/
			.integer('size', { defaultValue: 1,	coerce: true });
	},
	
	/** The hill climbings `update()` replaces each element in the state by the best element in its 
	neighbourhood, if there is any. The surroundings have all possible elements resulting from 
	either an increment or decrement (of the given `delta`) in each of the centre element's 
	dimensions.
	*/
	update: function update() {
		var mh = this, 
			localOptima = 0;
		return Future.all(this.state.map(function (elem) {
			var range = elem.neighbourhood(mh.delta);
			range.push(elem);
			return mh.evaluate(range).then(function (range) {
				var best = range[0];
				if (elem === best) {
					localOptima++;
				}
				return best;
			});			
		})).then(function (elems) {
			mh.state = elems;
			mh.__localOptima__ = localOptima;
			mh.onUpdate();
		});
	},
		
	/** `atLocalOptima()` checks if the search is currently stuck at a local optima.
	*/
	atLocalOptima: function atLocalOptima() {
		return this.__localOptima__ >= this.state.length;
	},
		
	/** A hill climbing search must finish when a local optimum is reached. This criteria is tested 
	together with all others.
	*/
	finished: function finished() {
		return Metaheuristic.prototype.finished.call(this) || this.atLocalOptima();
	},
		
	toString: function toString() {
		return (this.constructor.name || 'HillClimbing') +'('+ JSON.stringify(this) +')';
	}
}); // declare HillClimbing.
