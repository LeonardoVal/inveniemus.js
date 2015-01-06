define(['creatartis-base', 'inveniemus'], function (base, inveniemus) {
	var iterable = base.iterable,
		Future = base.Future;
	iterable([['RandomSearch', inveniemus.Metaheuristic]])
	.chain(iterable(inveniemus.metaheuristics).filterApply(function (name, mh) {
		return typeof mh === 'function' && mh.prototype instanceof inveniemus.Metaheuristic;
	}))
	.product([
		['HelloWorld', inveniemus.problems.HelloWorld],
		['sumMinimization', inveniemus.problems.testbeds.sumOptimization(10, -Infinity)],
		['sumMaximization', inveniemus.problems.testbeds.sumOptimization(10, +Infinity)],
		['Rosenbrock', inveniemus.problems.testbeds.Rosenbrock()]
	])
	.forEachApply(function (metaheuristic, testbed) {
		var metaheuristicName = metaheuristic[0],
			testbedName = testbed[0];
		metaheuristic = metaheuristic[1];
		testbed = testbed[1];
		describe(metaheuristicName +" with "+ testbedName, function () {
			async_it(": basic test.", function () {
				var mh = new metaheuristic({ problem: new testbed(), size: 10, steps: 5, logger: null }),
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
}); //// define.