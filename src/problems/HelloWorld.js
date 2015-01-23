/** # _"Hello World"_ problem

As it sounds, `HelloWorld` is a simple problem class, probably only useful for testing purposes.
*/
problems.HelloWorld = declare(Problem, { 
	title: "Hello world",
	description: "Simple problem where each element is a string, and the "+
		"optimization goes towards the target string.",
	
	/** In this simple problem each element is a string, and the optimization goes towards the 
	target string. The string to match is specified by the `target` parameter (`"Hello world!"` by 
	default).
	*/	
	constructor: function HelloWorld(params){
		Problem.call(this, params);
		initialize(this, params)
			.string('target', { coerce: true, defaultValue: 'Hello world!' });
		
		var target = this.target,
			__target__ = iterable(target).map(function (c) {
				return c.charCodeAt(0);
			}).toArray();
		/** The elements` representation is _ad-hoc_.
		*/
		this.representation = declare(Element, {
			/** The elements` `length` is equal to the length of the target string.
			*/
			length: target.length,
			
			/** An element `suffices()` when its equal to the target string.
			*/
			suffices: function suffices() {
				return this.mapping() === target;
			},
			
			/** An element evaluation is equal to its distance from target string.
			*/
			evaluate: function evaluate() {
				return this.evaluation = this.manhattanDistance(__target__, this.rangeMapping([32, 254]));
			},
			
			/** An element's values are always numbers. These are converted to a string by 
			converting each number to its corresponding Unicode character.
			*/
			mapping: function mapping() {
				return this.rangeMapping([32, 254]).map(function (n) {
					return String.fromCharCode(n |0);
				}).join('');
			}
		});
	},
	
	/** Since elements' evaluation is a distance, this value must be minimized to guide the search 
	towards the target string.
	*/
	compare: Problem.prototype.minimization
}); // declare HelloWorld.
