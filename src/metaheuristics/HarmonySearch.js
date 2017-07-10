/** # Harmony search.

[Harmony search](https://en.wikipedia.org/wiki/Harmony_search) is an optimization technique inspired
by the improvisation process of musicians proposed by Zong Woo Geem in 2001.
*/
var HarmonySearch = metaheuristics.HarmonySearch = declare(Metaheuristic, {
	/** The constructor takes the following parameters:
	*/
	constructor: function HarmonySearch(params) {
		Metaheuristic.call(this, params);
		initialize(this, params)
			/** + `harmonyProbability=90%` or _hmcr_ is the chance of a value of the next element
			being taken from one existing element in the state (or _"harmony memory"_).
			*/
			.number('harmonyProbability', { coerce: true, defaultValue: 0.9, minimum: 0, maximum: 1 })
			/** + `adjustProbability=30%` or _par_ is the chance of adjusting a value of the next
			element.
			*/
			.number('adjustProbability', { coerce: true, defaultValue: 0.5, minimum: 0, maximum: 1 })
			/** + `delta=1` is the distance between neighbouring states for discrete adjustments.
			*/
			.number('delta', { coerce: true, defaultValue: 1 })
			/** + `fretWidth=0.01` is the maximum adjustment for continuous variables, expressed as
			a ratio of the range.
			*/
			.number('fretWidth', { coerce: true, defaultValue: 0.01 })
		;
	},

	/** At each step only one new element is generated. Each of its values is taken from another
	element in the state with a chance equal to `harmonyProbability`, else it is defined at random.
	If the value comes from another element, it is slightly modified by `delta` with a chance equal
	to `adjustProbability`.
	*/
	expansion: function expansion() {
		var mh = this,
			random = this.random,
			model = this.problem.Element.prototype.model,
			values = model.map(function (range, i) {
				if (random.randomBool(mh.harmonyProbability)) {
					var value = random.choice(mh.state).values[i];
					if (random.randomBool(mh.adjustProbability)) {
						value += random.randomBool(0.5) ? -mh.delta : mh.delta;
						/*FIXME case for continuous variables
							var span = range.n;
							value += random.random(-span, +span) * mh.fretWidth;
						*/
					}
					return value;
				} else {
					return random.randomInt(0, range.n) |0;
				}
			});
		this.onExpand();
		return [new this.problem.Element(values)];
	},

	// ## Utilities ################################################################################

	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'HarmonySearch',
		serializer: function serialize_HarmonySearch(obj) {
			return [obj.__params__('harmonyProbability', 'adjustProbability', 'delta', 'fretWidth')];
		}
	}
}); // declare HarmonySearch.
