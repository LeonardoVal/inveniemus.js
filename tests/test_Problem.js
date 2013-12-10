/** inveniemus/tests/test_Problem.js:
	Test cases for Problem type of the Inveniemus library.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
define(['basis', 'inveniemus'], function (basis, inveniemus) {
	var verifier = new basis.Verifier();
	var Element = inveniemus.Element,
		Problem = inveniemus.Problem,
		RANDOM = basis.Randomness.DEFAULT;

// Comparisons. ////////////////////////////////////////////////////////////////

	function __randomElements__(count) {
		return RANDOM.randoms(count).map(function (r) {
			return new Element(undefined, r);
		});
	}

	verifier.test("Problem.minimization()", function () {
		for (var i = 0; i < 50; i++) {
			var elems = __randomElements__(i + 2);
			elems.sort(Problem.prototype.minimization);
			for (var j = 1; j < elems.length; j++) {
				this.assert(elems[j-1].evaluation <= elems[j].evaluation, "Evaluation ",
					elems[j-1].evaluation, " should be before evaluation ", 
					elems[j].evaluation, " in a minimization.");
			}
		}
	}); // Problem.minimization()
	
	verifier.test("Problem.maximization()", function () {
		for (var i = 0; i < 50; i++) {
			var elems = __randomElements__(i + 2);
			elems.sort(Problem.prototype.maximization);
			for (var j = 1; j < elems.length; j++) {
				this.assert(elems[j-1].evaluation >= elems[j].evaluation, "Evaluation ",
					elems[j-1].evaluation, " should be before evaluation ", 
					elems[j].evaluation, " in a maximization.");
			}
		}
	}); // Problem.maximization()
	
	verifier.test("Problem.approximation()", function () {
		for (var i = 0; i < 50; i++) {
			var elems = __randomElements__(i + 2),
				target = RANDOM.random();
			elems.sort(Problem.prototype.approximation.bind(verifier, target));
			for (var j = 1; j < elems.length; j++) {
				this.assert(Math.abs(target - elems[j-1].evaluation) <= Math.abs(target - elems[j].evaluation), 
					"Evaluation ", elems[j-1].evaluation, " should be before evaluation ", 
					elems[j].evaluation, " in an approximation of ", target, ".");
			}
		}
	}); // Problem.approximation()
	
/////////////////////////////////////////////////////////////////////////// Fin.
	return verifier;
});