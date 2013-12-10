/** inveniemus/src/problems/NQueensPuzzle.js
	Many reference problems and related utilities are provided in this file.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
problems.NQueensPuzzle = basis.declare(Problem, { ////////////////////////////
	title: "N-queens puzzle",
	description: "Generalized version of the classic problem of placing "+
		"8 chess queens on an 8x8 chessboard so that no two queens attack each other.",
	
	/** new problems.NQueensPuzzle(params):
		Generalized version of the classic problem of placing 8 chess queens on 
		an 8x8 chessboard so that no two queens attack each other. The amount
		of queens and board dimensions is specified by the N parameter.
	*/	
	constructor: function NQueensPuzzle(params){
		Problem.call(this, params);
		basis.initialize(this, params)
			.integer('N', { coerce: true, defaultValue: 8 });
		
		// Ad hoc Element declaration.
		var rowRange = basis.Iterable.range(this.N).toArray();
		/** problems.NQueensPuzzle.representation:
			The representation is an array of N positions, indicating the row of
			the queen for each column. Its evaluation is the count of diagonals
			shared by queens pairwise.
		*/
		this.representation = basis.declare(Element, {
			length: this.N,
			suffices: function suffices() {
				return this.evaluation === 0;
			},
			evaluate: function evaluate() {
				var rows = this.mapping(),
					count = 0;
				rows.forEach(function (row, i) {
					for (var j = 1; i + j < rows.length; j++) {
						if (rows[j] == row + j || rows[j] == row - j) {
							count++;
						}
					}
				});
				return this.evaluation = count;
			},
			mapping: function mapping() {
				return this.setMapping(rowRange);
			}
		});
	},
	
	compare: Problem.prototype.minimization
}); // declare NQueensPuzzle
