/** [Beam search](http://en.wikipedia.org/wiki/Beam_search) implementation for 
	the Inveniemus library. It is a form of parallel best-first search with 
	limited memory.
*/
var BeamSearch = metaheuristics.BeamSearch = basis.declare(Metaheuristic, {
	/** new metaheuristics.BeamSearch(params):
		Builds a beam search. The problem's element must have its successors 
		method implemented.
	*/
	constructor: function BeamSearch(params) {
		Metaheuristic.call(this, params);
	},
	
	/** metaheuristics.BeamSearch.successors(element):
		Returns the elements' successors. By default returns 
		element.successors().
	*/
	successors: function successors(element) {
		return element.successors();
	},
	
	/** metaheuristics.BeamSearch.expansion():
		Successors to all elements are calculated by calling the problem's
		successors method.
	*/
	expansion: function expansion() {
		var allSuccessors = [],
			successors = this.successors.bind(this);
		this.state.forEach(function (element) {
			allSuccessors = allSuccessors.concat(successors(element));
		});
		return allSuccessors;
	},
		
	// Utility methods. ////////////////////////////////////////////////////////
		
	toString: function toString() {
		return (this.constructor.name || 'BeamSearch') +'('+ JSON.stringify(this) +')';
	}
}); // declare BeamSearch.
