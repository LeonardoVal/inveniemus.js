define(['creatartis-base', 'inveniemus'], function (base, inveniemus) {
	var iterable = base.iterable,
		Problem = inveniemus.Problem,
		Metaheuristic = inveniemus.Metaheuristic;
	
	describe("Pareto", function () {
		it("analysis", function () { ///////////////////////////////////////////////////////////////
			var problem = new Problem({ objectives: [-Infinity, Infinity] }),
				mh = new Metaheuristic({ problem: problem }),
				analyzer = mh.paretoAnalysis.bind(mh);
			function buildElems(elems) {
				return elems.map(problem.newElement.bind(problem, null));
			}				
			function checkAnalysis(expectedCounts, elems) {
				iterable(elems).zip(expectedCounts).forEachApply(function (elem, counts) {
					expect(elem.pareto).toBeDefined();
					expect(elem.pareto.dominated.length).toBe(counts[0]);
					expect(elem.pareto.dominators.length).toBe(counts[1]);
				});
			}
			checkAnalysis([[0,0]], analyzer(buildElems([[1,2]])));
			checkAnalysis([[0,1], [1,0]], analyzer(buildElems([[1,2], [0,3]])));
			checkAnalysis([[0,1],[0,1],[2,0]], analyzer(buildElems([[1,2], [2,3], [0,4]])));
			checkAnalysis([[1,1],[0,2],[2,0]], analyzer(buildElems([[1,4], [2,3], [0,4]])));
			checkAnalysis([[0,0],[0,0]], analyzer(buildElems([[1,4], [0,3]])));
		});
		
		it("sorting", function () { ////////////////////////////////////////////////////////////////
			var problem = new Problem({ objectives: [-Infinity, Infinity] }),
				mh = new Metaheuristic({ problem: problem });
			function checkSort(elems) {
				elems = elems.map(problem.newElement.bind(problem, null));
				elems = mh.sort(elems);
				var comp;
				for (var i = 1; i < elems.length; i++) {
					comp = problem.compare(elems[i-1], elems[i]);
					expect(comp.domination).not.toBeLessThan(0); // Either NaN or >= 0, but not < 0.
				}				
			}
			checkSort([[1,2]]);
			checkSort([[1,2], [1,2], [2,1]]);
			checkSort([[1,2], [0,3], [2,3], [0,4]]);
		});
		/*
		async_it("simple optimization", function () { //////////////////////////////////////////////
			var ProblemExample = base.declare(Problem, {
					constructor: function ProblemExample(params) {
						Problem.call(this, params);
						this.criteria = Problem.paretoCriteria(params.criteria);
						this.__elementModel__ = base.Iterable.repeat({ min: 0, max: 1, discrete: false }, 3).toArray();
					},
					evaluation: function evaluation(element) {
						return element.values;
					},
					sortElements: function sortElements(elements) {
						return this.paretoSort(this.criteria, elements);
					}
				}),
				problem = new ProblemExample({ criteria: [-Infinity, 0.5, Infinity], objectives: 3 }),
				mh = new inveniemus.Metaheuristic({ problem: problem, size: 10, steps: 10, logger: null });
			mh.events.on('advanced', function (mh) {
				mh.state.forEach(function (elem) {
					expect(Array.isArray(elem.evaluation)).toBe(true);
				});
			});
			return mh.run();
		});*/
	}); // describe "Pareto"
	
}); //// define.