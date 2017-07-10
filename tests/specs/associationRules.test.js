define(['creatartis-base', 'inveniemus'], function (base, inveniemus) {
	var iterable = base.iterable,
		Future = base.Future,
		AssociationRuleLearning = inveniemus.problems.AssociationRuleLearning;

	describe("Association rules", function () {
		var keys1 = [0, 1, 2, 3],
			dataset1 = ['0001', '0010', '0100', '1100', '1110'].map(function (bits) {
				return bits.split('').map(function (bit) {
					return bit|0;
				});
			}),
			problem1 = new AssociationRuleLearning({ dataset: dataset1, keys: keys1 });

		it(": measures border cases.", function () {
			var element = new problem1.Element([0, 0, 0, 0]),
				measures = problem1.measures(element);
			['antecedentCount', 'consequentCount', 'ruleCount',
				'antecedentSupport', 'consequentSupport', 'ruleSupport',
				'confidence', 'lift', 'conviction', 'leverage'
			].forEach(function (id) {
				expect(measures.hasOwnProperty(id)).toBe(true);
				expect(measures[id]).toBe(0);
			});
			// Check measures caching in the element.
			expect(element.hasOwnProperty('__measures__')).toBe(false);
			expect(element.evaluate()).toEqual([0]);
			expect(element.hasOwnProperty('__measures__')).toBe(true);
		}); // it "measures border cases"

		it(": measures.", function () {
		// Rule: {0,1,2} -> {3}
			var measures = problem1.measures(new problem1.Element([1, 1, 1, 2]));
			expect(measures.antecedentCount).toBe(1);
			expect(measures.consequentCount).toBe(1);
			expect(measures.ruleCount).toBe(0);
			expect(measures.antecedentSupport).toBeCloseTo(1/5, 1);
			expect(measures.consequentSupport).toBeCloseTo(1/5, 1);
			expect(measures.ruleSupport).toBeCloseTo(0.0, 1);
			expect(measures.confidence).toBeCloseTo(0.0, 1);
		// Rule: {1} -> {2}
			measures = problem1.measures(new problem1.Element([0, 1, 2, 0]));
			expect(measures.antecedentCount).toBe(3);
			expect(measures.consequentCount).toBe(2);
			expect(measures.ruleCount).toBe(1);
			expect(measures.antecedentSupport).toBeCloseTo(3/5, 1);
			expect(measures.consequentSupport).toBeCloseTo(2/5, 1);
			expect(measures.ruleSupport).toBeCloseTo(1/5, 1);
			expect(measures.confidence).toBeCloseTo(1/3, 1);
		// Rule: {0} -> {1}
			measures = problem1.measures(new problem1.Element([1, 2, 0, 0]));
			expect(measures.antecedentCount).toBe(2);
			expect(measures.consequentCount).toBe(3);
			expect(measures.ruleCount).toBe(2);
			expect(measures.antecedentSupport).toBeCloseTo(2/5, 1);
			expect(measures.consequentSupport).toBeCloseTo(3/5, 1);
			expect(measures.ruleSupport).toBeCloseTo(2/5, 1);
			expect(measures.confidence).toBeCloseTo(2/2, 1);
		}); // it "measures"
	}); // describe
}); //// define.
