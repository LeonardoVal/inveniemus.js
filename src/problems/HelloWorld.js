/** As it sounds, HelloWorld is a simple problem class, probably only useful for
	testing purposes.
*/
problems.HelloWorld = basis.declare(Problem, { /////////////////////////////////
	title: "Hello world",
	description: "Simple problem where each element is a string, and the "+
		"optimization goes towards the target string.",
	
	/** new problems.HelloWorld(params):
		Simple problem where each element is a string, and the optimization 
		goes towards the target string. The string to match is specified by the
		'target' parameter.
	*/	
	constructor: function HelloWorld(params){
		Problem.call(this, params);
		basis.initialize(this, params)
			.string('target', { coerce: true, defaultValue: 'Hello world!' });
		
		var target = this.target,
			__target__ = iterable(target).map(function (c) {
				return c.charCodeAt(0);
			}).toArray();
		// Ad hoc Element declaration.
		this.representation = basis.declare(Element, {
			length: target.length,
			minimumValue: 32,
			maximumValue: 254,
			suffices: function suffices() {
				return this.mapping() === target;
			},
			evaluate: function evaluate() {
				return this.evaluation = this.manhattanDistance(__target__, this.values);
			},
			mapping: function mapping() {
				return iterable(this.values).map(function (n) {
					return String.fromCharCode(n | 0);
				}).join('');
			}
		});
	},
	
	compare: Problem.prototype.minimization
}); // declare HelloWorld.
