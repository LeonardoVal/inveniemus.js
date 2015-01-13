/** # Beam search

[Beam search](http://en.wikipedia.org/wiki/Beam_search) is a form of parallel 
best-first search with limited memory.
*/
var BeamSearch = metaheuristics.BeamSearch = declare(Metaheuristic, {
	/** The constructor does not take any special parameters.
	*/
	constructor: function BeamSearch(params) {
		Metaheuristic.call(this, params);
	},
	
	/** `successors(element)` returns the elements' successors. The problem's 
	element must have its `successors` method implemented.
	*/
	successors: function successors(element) {
		return element.successors();
	},
	
	/** The expansion in beam search adds all successors of all elements to the
	state. After being evaluated and sieved only the best will remain.
	*/
	expansion: function expansion() {
		var allSuccessors = [],
			successors = this.successors.bind(this);
		this.state.forEach(function (element) {
			allSuccessors = allSuccessors.concat(successors(element));
		});
		this.onExpand();
		return allSuccessors;
	},
	
	toString: function toString() {
		return (this.constructor.name || 'BeamSearch') +'('+ JSON.stringify(this) +')';
	}
}); // declare BeamSearch.
