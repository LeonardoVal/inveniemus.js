define(['creatartis-base', 'inveniemus'], function (base, inveniemus) {
	var iterable = base.iterable,
		Future = base.Future;
	iterable([['RandomSearch', inveniemus.Metaheuristic]])
	.chain(iterable(inveniemus.metaheuristics).filterApply(function (name, mh) {
		return typeof mh === 'function' && mh.prototype instanceof inveniemus.Metaheuristic;
	}))
	.product([
		['sumMinimization', inveniemus.problems.testbeds.sumOptimization(10, -Infinity)],
		['sumMaximization', inveniemus.problems.testbeds.sumOptimization(10, +Infinity)],
		['sumApproximation', inveniemus.problems.testbeds.sumOptimization(10, Math.PI)],
	])
	.forEachApply(function (metaheuristic, testbed) {
		var metaheuristicName = metaheuristic[0],
			testbedName = testbed[0],
			SIZE = 30,
			STEPS = 10;
		metaheuristic = metaheuristic[1];
		testbed = testbed[1];
		describe(metaheuristicName +" with "+ testbedName, function () {
			async_it(": basic test.", function () {
				var mh = new metaheuristic({ 
					problem: testbed, 
					size: SIZE, 
					steps: STEPS, 
					logger: null
				});
				mh.events.on('advanced', function () {
					expect(mh.step).not.toBeGreaterThan(STEPS);
					expect(mh.state.length).toBe(SIZE);
					var stepBest = mh.state[0];
					mh.state.forEach(function (elem) {
						expect(elem instanceof inveniemus.Element).toBe(true); // All elements should inherit from Element.
						expect(isNaN(elem.evaluation)).toBe(false); // All elements should be evaluated.
						expect(mh.problem.compare(stepBest, elem)).not.toBeGreaterThan(0); // Elements should be properly sorted.
					});
				});
				return mh.run();
			});
		});
	});
}); //// define.