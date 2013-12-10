/** inveniemus/src/metaheuristics/HillClimbing.js
	Hill Climbing implementation for the Inveniemus library.
	See <http://en.wikipedia.org/wiki/Hill_climbing>.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// HillClimbing metaheuristic. /////////////////////////////////////////////////

var HillClimbing = metaheuristics.HillClimbing = basis.declare(Metaheuristic, {
	/** new HillClimbing(params):
		Builds a hill climbing search.
		See <http://en.wikipedia.org/wiki/Hill_climbing>.
	*/
	constructor: function HillClimbing(params) {
		Metaheuristic.call(this, params);
		basis.initialize(this, params)
		/** HillClimbing.delta=0.01:
			The radius of the elements surroundings in every dimension, that is
			checked by this algorithm.
		*/
			.number('delta', { defaultValue: 0.01, coerce: true })
		/** HillClimbing.size=1:
			Default value for size is 1.
		*/
			.integer('size', { defaultValue: 1,	coerce: true });
	},
	
	/** HillClimbing.expansion():
		New elements are calculated by adding all variation of existing elements
		in the state. Each variation is either an increment or decrement in one
		(and only one) of the element's dimensions.
	*/
	expansion: function expansion() {
		var delta = this.delta,
			elems = [];
		this.__previous__ = this.state[0]; // This is for local optimum detection.
		this.state.forEach(function (element) {
			elems = elems.concat(element.neighbourhood(delta));
		});
		basis.raiseIf(elems.length < 1, "Expansion failed to produce any new elements.");
		return elems;
	},
		
	/** HillClimbing.atLocalOptimum():
		Checks if the search is currently at a local optimum.
	*/
	atLocalOptimum: function atLocalOptimum() {
		return this.__previous__ === this.state[0];
	},
		
	/** HillClimbing.finished():
		Hill climbing search must finish when a local optimum is reached. This
		criteria is tested together with all others.
	*/
	finished: function finished() {
		return Metaheuristic.prototype.finished.call(this) || this.atLocalOptimum();
	},
		
	// Utility methods. ////////////////////////////////////////////////////////
		
	toString: function toString() {
		return (this.constructor.name || 'HillClimbing') +'('+ JSON.stringify(this) +')';
	}
}); // declare HillClimbing.
