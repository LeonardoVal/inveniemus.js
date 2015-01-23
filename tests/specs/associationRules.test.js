define(['creatartis-base', 'inveniemus'], function (base, inveniemus) {
	var iterable = base.iterable,
		Future = base.Future,
		AssociationRule = inveniemus.problems.AssociationRule;
	
	describe("Association rules", function () {
		var testAssociationRule = AssociationRule.booleanRules([0,1,2,3]),
			dataset1 = ['0001', '0010', '0100', '1100', '1110'].map(function (bits) {
				return bits.split('').map(function (bit) {
					return bit|0;
				});
			});

		it(": measures border cases.", function () {
			[(new testAssociationRule()).measures([]), // Empty dataset. 
				(new testAssociationRule([0, 0, 0, 0])).measures(dataset1), // Empty rule
			].forEach(function (measures) {
				['antecedentCount', 'consequentCount', 'ruleCount',
					'antecedentSupport', 'consequentSupport', 'ruleSupport',
					'confidence', 'lift', 'conviction', 'leverage'
				].forEach(function (id) {
					expect(measures[id]).toBe(0);
				});
			});
		}); // it "measures border cases"
		
		it(": measures.", function () {
		// Rule: {0,1,2} -> {3}
			measures = (new testAssociationRule([0.4, 0.4, 0.4, 0.7])).measures(dataset1);
			expect(measures.antecedentCount).toBe(1);
			expect(measures.consequentCount).toBe(1);
			expect(measures.ruleCount).toBe(0);
			expect(measures.antecedentSupport).toBeCloseTo(1/5, 1);
			expect(measures.consequentSupport).toBeCloseTo(1/5, 1);
			expect(measures.ruleSupport).toBeCloseTo(0.0, 1);
			expect(measures.confidence).toBeCloseTo(0.0, 1);
		// Rule: {1} -> {2}
			measures = (new testAssociationRule([0.0, 0.4, 0.7, 0.0])).measures(dataset1);
			expect(measures.antecedentCount).toBe(3);
			expect(measures.consequentCount).toBe(2);
			expect(measures.ruleCount).toBe(1);
			expect(measures.antecedentSupport).toBeCloseTo(3/5, 1);
			expect(measures.consequentSupport).toBeCloseTo(2/5, 1);
			expect(measures.ruleSupport).toBeCloseTo(1/5, 1);
			expect(measures.confidence).toBeCloseTo(1/3, 1);
		// Rule: {0} -> {1}
			measures = (new testAssociationRule([0.4, 0.7, 0.0, 0.0])).measures(dataset1);
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