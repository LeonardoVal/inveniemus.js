/** # _"Hello World"_ problem

As it sounds, `HelloWorld` is a simple problem class, probably only useful for testing purposes.
*/
problems.HelloWorld = declare(Problem, {
	title: "Hello world",
	description: "Simple problem where each element is a string, and the "+
		"optimization goes towards the target string.",

	/** In this simple problem each element is a string, and the optimization goes towards the
	target string. The string to match is specified by the `target` parameter (`"Hello world!"` by
	default). Since elements' evaluation is a distance, this value must be minimized to guide the
	search towards the target string.
	*/
	constructor: function HelloWorld(params){
		initialize(this, params)
			.string('target', { coerce: true, defaultValue: 'Hello world!' });
		this.__target__ = iterable(this.target).map(function (c) {
			return c.charCodeAt(0);
		}).toArray();
		/** The elements' length is equal to the length of the target string. Every value is
		between 32 (inclusive) and 127 (exclusive), which is the range of visible characters in
		ASCII.
		*/
		Problem.call(this, base.copy({
				objective: -Infinity,
				elementModel: Iterable.repeat({ n: 127 - 32 }, this.target.length).toArray()
			}, params)
		);
	},

	/** An element's values are always numbers. These are converted to a string by converting each
	number to its corresponding Unicode character.
	*/
	mapping: function mapping(element) {
		return element.values().map(function (v) {
			return String.fromCharCode(v + 32);
		}).join('');
	},

	/** An element evaluation is equal to its distance from target string.
	*/
	evaluation: function evaluation(element) {
		return element.manhattanDistance(this.__target__, element.rangeMapping([32, 127]));
	},

	/** An element is sufficient when its equal to the target string.
	*/
	sufficientElement: function sufficientElement(element) {
		return this.mapping(element) === this.target;
	},

	// ## Utilities ################################################################################

	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'HelloWorld',
		serializer: function serialize_HelloWorld(obj) {
			return [obj.__params__('target')];
		}
	}
}); // declare HelloWorld.
