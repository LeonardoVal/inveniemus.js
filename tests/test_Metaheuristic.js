/** inveniemus/tests/test_Metaheuristic.js:
	Test cases for metaheuristics of the Inveniemus library.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
define(['basis', 'inveniemus'], function (basis, inveniemus) {
	var verifier = new basis.Verifier(); // Module object.

// Testing problems. ///////////////////////////////////////////////////////////
	
	/* Returns a Metaheuristic.onStep event that performs basic checks.
	*/
	verifier.stepTest = function stepTest(size, steps) {
		var runBest, stepBest;
		return function (mh){
			verifier.assertEqual(size, mh.state.length, "State size should be ", size, " but it is ", mh.state.length);
			var stepBest = mh.state[0];
			verifier.assertDefined(stepBest, 
				"Best element is not defined.");
			verifier.assert(Array.isArray(stepBest.values), 
				"Best element's values is not an array.");
			verifier.assertEqual(stepBest.length, stepBest.values.length, 
				"Element length should be ", stepBest.length, " but it is ", stepBest.values.length);
			if (mh.step > 0) {
				verifier.assert(mh.step <= steps, 
					"Run has more steps than it should.");
				verifier.assertFalse(isNaN(stepBest.evaluation), 
					"Best element is not evaluated.");
				if (runBest) { // Check if the search is actually improving the best element.
					verifier.assert(mh.problem.compare(runBest, stepBest) >= 0, 
						"Best element of this step (evaluation= ", stepBest.evaluation, 
						") is worse than the previous one's (evaluation= ", runBest.evaluation, ").");
				}
				runBest = stepBest;
			} else {
				runBest = null; // Clean because the metaheuristic has been reset.
			}
		};
	}
	
// Sum optmization. ////////////////////////////////////////////////////////

	verifier.test("Sum optimization with random search", function () {
		var mhs = [], mh;
		[1,2,10,100].forEach(function (size){
			[1,10,50].forEach(function (steps) {
				[-Infinity, 0, Infinity].forEach(function (target){
					mh = new inveniemus.Metaheuristic({
						problem: new inveniemus.problems.SumOptimization({ target: target }),
						size: size, steps: steps, logger: null
					});
					mh.events.on('onStep', verifier.stepTest(size, steps));
					mhs.push(mh);
				});
			});
		});
		return basis.Future.all(basis.iterable(mhs).map(function (mh){
			return mh.run();
		})).then(function (results) {
			return "Ran "+ results.length +" searches.";
		});
	});
	
	// Hello world. ////////////////////////////////////////////////////////////

	verifier.test("HelloWorld problem with random search", function () {
		var problem = new inveniemus.problems.HelloWorld({ target: "Hello world!" }),
			mhs = [], mh;
		[1,2,10,100].forEach(function (size){
			[1,10,100].forEach(function (steps) {
				mh = new inveniemus.Metaheuristic({
					problem: problem,
					size: size, steps: steps, logger: null
				});
				mh.events.on('onStep', verifier.stepTest(size, steps));
				mhs.push(mh);
			});
		});
		return basis.Future.all(basis.iterable(mhs).map(function (mh){
			return mh.run();
		})).then(function (results) {
			return "Ran "+ results.length +" searches.";
		});
	});
	
/////////////////////////////////////////////////////////////////////////// Fin.
	return verifier;
});