define(['creatartis-base', 'sermat', 'inveniemus'], function (base, Sermat, inveniemus) {
	var Element = inveniemus.Element,
		Problem = inveniemus.Problem,
		utilities = inveniemus.utilities;

	describe('utilities', function () {
// Han encoding and decoding. //////////////////////////////////////////////////////////////////////
		it("Han encoding & decoding", function () {
			expect(typeof utilities.encodeHan).toBe('function');
			expect(typeof utilities.decodeHan).toBe('function');
			expect(typeof utilities.emblemHan).toBe('function');

			var countCJK = 0x9FD0 - 0x4DC0 + 1,
				countHangul = 0xD7A3 - 0xAC00 + 1;
			base.iterable({
				'\u4DC0\u4DC1\u4DC2\u4DC5\u4DC7\u4DC9': [0, 1, 2, 5, 7, 9],
				'\u9FD0\u9FCF\u9FC9': [countCJK - 1, countCJK - 2, countCJK - 8],
				'\uD7A3\uD7A2\uD7A0\uD79B': [-1, -2, -4, -9],
				'\uAC00\uAC02': [-countHangul, -countHangul + 2],
			}).forEachApply(function (str, vs) {
				expect(utilities.encodeHan(vs)).toBe(str);
				expect(utilities.decodeHan(str).join(',')).toBe(vs.join(','));
			});

			var problem = new Problem(),
				str, elem;
			for (var i = 0; i < 10; i++) {
				elem = new problem.Element();
				str = utilities.encodeHan(elem.values());
				expect(utilities.emblemHan(elem)).toBe('[Element ? '+ str +']');
				elem.evaluation = [0.123];
				expect(utilities.emblemHan(elem)).toBe('[Element 0.123 '+ str +']');
			}
		}); // it "constructor"

	}); // describe "utilities"
});
