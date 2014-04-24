/** [Hill Climbing](http://en.wikipedia.org/wiki/Hill_climbing) implementation 
	for the Inveniemus library.
*/
var HillClimbing = metaheuristics.HillClimbing = declare(Metaheuristic, {
	/** new metaheuristics.HillClimbing(params):
		Builds a [hill climbing](http://en.wikipedia.org/wiki/Hill_climbing) 
		search.
	*/
	constructor: function HillClimbing(params) {
		Metaheuristic.call(this, params);
		initialize(this, params)
		/** metaheuristics.HillClimbing.delta=0.01:
			The radius of the elements surroundings in every dimension, that is
			checked by this algorithm.
		*/
			.number('delta', { defaultValue: 0.01, coerce: true })
		/** metaheuristics.HillClimbing.size=1:
			Default value for size is 1.
		*/
			.integer('size', { defaultValue: 1,	coerce: true });
	},
	
	/** metaheuristics.HillClimbing.update():
		Each element in the state is replaced by the best element in its 
		neighbourhood, if there is any. The surroundings have all possible 
		elements resulting from either an increment or decrement (of the given
		delta) in each of the centre element's dimensions.
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
		});
	},
		
	/** metaheuristics.HillClimbing.atLocalOptima():
		Checks if the search is currently stuck at local optima.
	*/
	atLocalOptima: function atLocalOptima() {
		return this.__localOptima__ >= this.state.length;
	},
		
	/** metaheuristics.HillClimbing.finished():
		Hill climbing search must finish when a local optimum is reached. This
		criteria is tested together with all others.
	*/
	finished: function finished() {
		return Metaheuristic.prototype.finished.call(this) || this.atLocalOptima();
	},
		
	// Utility methods. ////////////////////////////////////////////////////////
		
	toString: function toString() {
		return (this.constructor.name || 'HillClimbing') +'('+ JSON.stringify(this) +')';
	}
}); // declare HillClimbing.
