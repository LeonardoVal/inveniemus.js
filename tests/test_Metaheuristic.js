/** inveniemus/tests/test_Metaheuristic.js:
	Test cases for metaheuristics of the Inveniemus library.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
define(['basis', 'inveniemus'], function (basis, inveniemus) {
	var verifier = new basis.Verifier(); // Module object.

	function stepTest(metaheuristic, problem, size, steps) {
		var mh = new metaheuristic({
			problem: new problem(),
			size: size,
			steps: steps, 
			logger: null
		}), runBest, stepBest;
		mh.events.on('onStep', function () {
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
		});
		return mh.run();
	}
	
	var metaheuristics = basis.iterable(inveniemus.metaheuristics)
			.filter(function (pair) {
				return typeof pair[1] === 'function' && pair[1].prototype instanceof inveniemus.Metaheuristic;
			}, function (pair) {
				return pair[1];
			}).toArray(),
		problems = basis.iterable(inveniemus.problems)
			.filter(function (pair) {
				return typeof pair[1] === 'function' && pair[1].prototype instanceof inveniemus.Problem;
			}, function (pair) {
				return pair[1];
			}).toArray();
	metaheuristics.unshift(inveniemus.Metaheuristic); // Base class implements a random search.

	metaheuristics.forEach(function (metaheuristic) {
		problems.forEach(function (problem) {
			verifier.test(metaheuristic.name +"() against "+ problem.name +"()", function () {
				return basis.Future.sequence([1, 10, 50], function (size){
					return basis.Future.sequence([1, 10, 50], function (steps) {
						return stepTest(metaheuristic, problem, size, steps);
					});
				}).then(function (best) {
					return "Last run's best evaluated to "+ best.evaluation +".";
				});
			});
		});
	});
	
/////////////////////////////////////////////////////////////////////////// Fin.
	return verifier;
});