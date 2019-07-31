/** _Hello world_ problems are simple problem, useful for testing purposes. Each 
 * element represents a string, and the optimization goes towards a given target 
 * string. The string to match is `"Hello world!"` by default. 
 * 
 * Since elements' evaluation is a distance, it must be minimized to guide the 
 * search towards the target string.
 */
class HelloWorldProblem extends Problem {
	/** @inheritdoc */
	get title() {
		return "Hello world problem";
	}

	/** @inheritdoc */
	get description() {
		return "Simple problem where each element represents a string, and "+
			"the optimization goes towards a target string.";
	}

	/** 
	 * @inheritdoc 
	 * @param {string} params.target - The string to aim to. 
	*/
	constructor(params = null) {
		super({
			objective: -Infinity,
			targetString: params && params.targetString +'' || 'Hello world!'
		});
	}

	static Element(problem) {
		return class HelloWorldProblem$Element extends Element {
			/** @inheritdoc */
			static get problem() {
				return problem;
			}

			/** The elements' length is equal to the length of the target 
			 * string. Every value is between 32 (inclusive) and 127 
			 * (exclusive), which is the range of visible characters in
			 * ASCII.
			 */
			static get model() {
				return Object.freeze(
					(new Array(problem.targetString.length))
						.fill({ n: 127 - 32 })
				);
			} 

			/** An element's values are always numbers. These are converted 
			 * to a string by converting each number to its corresponding 
			 * Unicode character.
			 * 
			 * @returns {string}
			*/
			mapping() {
				return this.values()
					.map( (v) => String.fromCharCode(v + 32) )
					.join('');
			}

			/** An element evaluation is equal to its distance from target 
			 * string.
			 * 
			 * @returns {number}
			*/
			evaluate() {
				let targetCodes = [...problem.targetString]
						.map( (chr) => chr.charCodeAt(0) ),
					rangeMapping = this.rangeMapping([32, 127]);
				return this.manhattanDistance(targetCodes, rangeMapping);
			}

			/** An element is sufficient when its equal to the target string.
			 * 
			 * @returns {boolean}
			 */
			suffices() {
				return this.mapping() === problem.targetString;
			}
		};
	}

	/** Serialization and materialization using Sermat.
	*/
	static get __SERMAT__() {
		return {
			identifier: 'HelloWorldProblem',
			serializer: function serialize_HelloWorld(obj) {
				return [obj.__params__('target')];
			}
		}
	}
} // class HelloWorldProblem

problems.HelloWorldProblem = HelloWorldProblem; 
