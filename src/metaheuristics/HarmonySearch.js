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
			/** + `delta=0.1` is the distance between neighbouring states.
			*/
			.number('delta', { coerce: true, defaultValue: 0.1 });
	},
	
	/** At each step only one new element is generated. Each of its values is taken from another
	element in the state with a chance equal to `harmonyProbability`, else it is defined at random.
	If the value comes from another element, it is slightly modified by `delta` with a chance equal
	to `adjustProbability`.
	*/
	expansion: function expansion() {
		var proto = this.state[0],
			values = new Array(length);
		for (var i = 0; i < proto.length; ++i) {
			if (this.random.randomBool(this.harmonyProbability)) {
				values[i] = this.random.choice(this.state).values[i];
				if (this.random.randomBool(this.adjustProbability)) {
					values[i] = proto.clampValue(values[i] + this.random.choice([-1, +1]) * this.delta, i);
				}
			} else {
				values[i] = proto.randomValue(i);
			}
		}
		return [new proto.constructor(values)];
	},
	
	toString: function toString() {
		return (this.constructor.name || 'HarmonySearch') +'('+ JSON.stringify(this) +')';
	}
}); // declare HarmonySearch.
