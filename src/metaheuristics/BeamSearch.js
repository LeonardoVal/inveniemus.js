/** inveniemus/src/metaheuristics/BeamSearch.js
	Beam search implementation for the Inveniemus library. It is a form of 
	parallel best-first search with limited memory.
	See <http://en.wikipedia.org/wiki/Beam_search>.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
var BeamSearch = metaheuristics.BeamSearch = basis.declare(Metaheuristic, {
	/** new BeamSearch(params):
		Builds a beam search. The problem should have the successors method
		implemented.
	*/
	constructor: function BeamSearch(params) {
		Metaheuristic.call(this, params);
	},
	
	/** BeamSearch.successors(element):
		Returns the elements' successors. By default returns 
		element.successors().
	*/
	successors: function successors(element) {
		return element.successors();
	},
	
	/** BeamSearch.expansion():
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
