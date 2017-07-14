/** # N queens puzzle problem

A generalized version of the classic [8 queens puzzle](http://en.wikipedia.org/wiki/Eight_queens_puzzle),
a problem of placing 8 chess queens on an 8x8 chessboard so that no two queens may attack each
other.
*/
problems.NQueensPuzzle = declare(Problem, {
	title: "N-queens puzzle",
	description: "Generalized version of the classic problem of placing "+
		"8 chess queens on an 8x8 chessboard so that no two queens attack each other.",

	/** The constructor takes only one particular parameter:
	*/
	constructor: function NQueensPuzzle(params) {
		/** Since the evaluation is defined as the number of shared diagonals, it must be
		minimized.
		*/
		params = Object.assign({ N: 8 }, params);
		Problem.call(this, params = Object.assign(params, {
			objective: -Infinity,
			/** The representation is an array of `N` positions, indicating the row of the
			queen for each column.
			*/
			elementModel: Iterable.repeat({ n: params.N }, params.N - 1).toArray()
		}));
		initialize(this, params)
			/** + `N=8`: the number of queens and both dimensions of the board.
			*/
			.integer('N', { coerce: true, defaultValue: 8 });
		this.__rowRange__ = Iterable.range(this.N).toArray();
	},

	mapping: function mapping(element) {
		return element.setMapping(this.__rowRange__);
	},

	/** The elements' evaluation is the count of diagonals shared by queens pairwise.
	*/
	evaluation: function evaluation(element) {
		var rows = this.mapping(element),
			count = 0;
		rows.forEach(function (row, i) {
			for (var j = 1; i + j < rows.length; j++) {
				if (rows[j] == row + j || rows[j] == row - j) {
					count++;
				}
			}
		});
		return count;
	},

	/** It is sufficient when no pair of queens share diagonals.
	*/
	sufficientElement: function sufficientElement(element) {
		return element.evaluation === 0;
	},

	// ## Utilities ################################################################################

	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'NQueensPuzzle',
		serializer: function serialize_NQueensPuzzle(obj) {
			return [obj.__params__('N')];
		}
	}
}); // declare NQueensPuzzle
