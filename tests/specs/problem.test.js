define(['creatartis-base', 'inveniemus'], function (base, inveniemus) {
	var Element = inveniemus.Element,
		Problem = inveniemus.Problem,
		RANDOM = base.Randomness.DEFAULT,
		iterable = base.iterable;

	function __randomElements__(problem, count) {
		return RANDOM.randoms(count).map(function (r) {
			return new Element(problem, undefined, r);
		});
	}
		
	describe("Problem", function () {
		it("single objective comparison", function () {
			var problem = new Problem();
			for (var i = 0; i < 30; i++) {
				var evals = RANDOM.randoms(i + 2),
					target = RANDOM.random();
				evals.sort(problem.singleObjectiveComparison.bind(problem, -Infinity)).reverse();
				for (var j = 1; j < evals.length; j++) {
					expect(evals[j - 1]).not.toBeGreaterThan(evals[j]);
				}
				evals.sort(problem.singleObjectiveComparison.bind(problem, +Infinity)).reverse();
				for (j = 1; j < evals.length; j++) {
					expect(evals[j - 1]).not.toBeLessThan(evals[j]);
				}
				evals.sort(problem.singleObjectiveComparison.bind(problem, target)).reverse();
				for (j = 1; j < evals.length; j++) {
					expect(Math.abs(target - evals[j - 1])).not.toBeGreaterThan(Math.abs(target - evals[j]));
				}
			}
		}); // it "single objective comparison"
		
		it("Pareto comparison", function () { //////////////////////////////////////////////////////
			var problem = new Problem(),
				comparator = problem.paretoComparison.bind(problem, [-Infinity, Infinity]),
				comp;
			function checkComparison(eval1, eval2, expectedComparisons, expectedDomination) {
				var comps = comparator(eval1, eval2);
				iterable(comps).zip(expectedComparisons).forEachApply(function (c, e) {
					expect(c)[e > 0 ? 'toBeGreaterThan' : e < 0 ? 'toBeLessThan' : 'toBe'](0);
				});
				if (isNaN(expectedDomination)) {
					expect(comps.domination).toBeNaN();
				} else {
					expect(comps.domination).toBe(expectedDomination);
				}
			}
			checkComparison([1,2], [2,1], [1,1], 2);
			checkComparison([2,1], [1,2], [-1,-1], -2);
			checkComparison([1,2], [2,2], [1,0], 1);
			checkComparison([1,2], [0,2], [-1,0], -1);
			checkComparison([1,2], [1,2], [0,0], 0);
			checkComparison([1,2], [2,3], [1,-1], NaN);
			
			expect(comparator.bind(null, [1], [1,2])).toThrow();
			expect(comparator.bind(null, [1,2], [1,2,3])).toThrow();
		});
	}); //// describe "Problem"
}); //// define.