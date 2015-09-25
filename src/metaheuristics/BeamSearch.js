/** # Beam search

[Beam search](http://en.wikipedia.org/wiki/Beam_search) is a form of parallel best-first search with 
limited memory.
*/
var BeamSearch = metaheuristics.BeamSearch = declare(Metaheuristic, {
	/** The constructor m take any special parameters.
	*/
	constructor: function BeamSearch(params) {
		Metaheuristic.call(this, params);
		initialize(this, params)
			/** A `delta` may be specified for the default `successors` for continuous variables.
			*/
			.number('delta', { ignore: true, coerce: true });
	},
	
	/** `successors(element)` returns the elements' successors. The problem's element must have its 
	`successors` method implemented.
	*/
	successors: function successors(element) {
		return element.neighbourhood(this.delta);
	},
	
	/** The expansion in beam search adds all successors of all elements to the	state. After being 
	evaluated and sieved only the best will remain.
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
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'BeamSearch',
		serializer: function serialize_BeamSearch(obj) {
			return [obj.__params__('delta')];
		}
	}
}); // declare BeamSearch.
