define(['creatartis-base', 'inveniemus'], function (base, inveniemus) {
	var Element = inveniemus.Element,
		Problem = inveniemus.Problem,
		RANDOM = base.Randomness.DEFAULT;

	function __randomElements__(count) {
		return RANDOM.randoms(count).map(function (r) {
			return new Element(undefined, r);
		});
	}
		
	describe("Problem", function () {
		it("minimization", function () {
			for (var i = 0; i < 50; i++) {
				var elems = __randomElements__(i + 2);
				elems.sort(Problem.prototype.minimization);
				for (var j = 1; j < elems.length; j++) {
					expect(elems[j-1].evaluation).not.toBeGreaterThan(elems[j].evaluation);
				}
			}
		}); // it "minimization"
		
		it("maximization", function () {
			for (var i = 0; i < 50; i++) {
				var elems = __randomElements__(i + 2);
				elems.sort(Problem.prototype.maximization);
				for (var j = 1; j < elems.length; j++) {
					expect(elems[j-1].evaluation).not.toBeLessThan(elems[j].evaluation);
				}
			}
		}); // it "maximization"
		
		it("approximation", function () {
			for (var i = 0; i < 50; i++) {
				var elems = __randomElements__(i + 2),
					target = RANDOM.random();
				elems.sort(Problem.prototype.approximation.bind(this, target));
				for (var j = 1; j < elems.length; j++) {
					expect(Math.abs(target - elems[j-1].evaluation)).not.toBeGreaterThan(Math.abs(target - elems[j].evaluation));
				}
			}
		}); // it "approximation"
	}); //// describe "Problem"
}); //// define.