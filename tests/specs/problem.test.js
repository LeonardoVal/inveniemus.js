define(['creatartis-base', 'inveniemus'], function (base, inveniemus) {
	var Element = inveniemus.Element,
		Problem = inveniemus.Problem,
		RANDOM = base.Randomness.DEFAULT,
		iterable = base.iterable,
		Future = base.Future;

	describe("Problem", function () {
		it("single objective comparison", function () { ////////////////////////////////////////////
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
		}); // it "Pareto comparison"
		
		it("asynchronous evaluation", function (done) { ////////////////////////////////////////////
			var problem = new Problem(),
				oldEvaluation = problem.evaluation,
				elements = 	base.Iterable.repeat(0, 10).map(function () {
					return problem.newElement();
				}).toArray();
			problem.evaluation = function evaluation(element) {
				var r = new Future();
				setTimeout(function () {
					r.resolve(oldEvaluation.call(problem, element));
				}, 10);
				return r;
			};
			var evaluations = problem.evaluate(elements);
			expect(Future.__isFuture__(evaluations)).toBe(true);
			return evaluations.then(function (es) {
				es.forEach(function (e, i) {
					expect(e).toBe(elements[i].evaluation);
				});
			}).then(done);
		}); // it "asynchronous evaluation"
		
	}); //// describe "Problem"
}); //// define.