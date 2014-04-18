define(['basis', 'inveniemus'], function (basis, inveniemus) {
	var iterable = basis.iterable,
		Future = basis.Future;

	var metaheuristics = iterable(inveniemus.metaheuristics)
			.mapApply(function (name, member) {
				return member;
			}, function (member) {
				return typeof member === 'function' && member.prototype instanceof inveniemus.Metaheuristic;
			}).toArray(),
		problems = iterable(inveniemus.problems)
			.mapApply(function (name, member) {
				return member;
			}, function (member) {
				return typeof member === 'function' && member.prototype instanceof inveniemus.Problem;
			}).toArray();
	metaheuristics.unshift(inveniemus.Metaheuristic); // Base class implements a random search.

	metaheuristics.forEach(function (metaheuristic) {
		describe("Metaheuristic "+ metaheuristic.name, function () {
			problems.forEach(function (problem) {
				async_it(" with "+ problem.name, function () {
					var mh = new metaheuristic({ problem: new problem(), size: 10, steps: 5, logger: null }),
						runBest, stepBest;
					mh.events.on('onStep', function () {
						expect(mh.state.length).toBe(size);
						var stepBest = mh.state[0];
						expect(stepBest).toBeDefined();
						expect(Array.isArray(stepBest.values)).toBe(true);
						expect(stepBest.values.length).toBe(stepBest.length);
						if (mh.step > 0) {
							expect(mh.step).not.toBeGreaterThen(steps);
							expect(isNaN(stepBest.evaluation)).toBe(false);
							if (runBest) { // Check if the search is actually improving the best element.
								expect(mh.problem.compare(runBest, stepBest)).not.toBeLessThan(0);
							}
							runBest = stepBest;
						} else {
							runBest = null; // Clean because the metaheuristic has been reset.
						}
					});
					return mh.run();
				});
			});
		});
	});
}); //// define.