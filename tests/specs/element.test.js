define(['creatartis-base', 'inveniemus'], function (base, inveniemus) {
	var Element = inveniemus.Element,
		Problem = inveniemus.Problem;

// Evaluation utilities. ///////////////////////////////////////////////////////
	describe('Element', function () {
		it("constructor", function () {
			var problem = new Problem(),
				elem = new Element(problem);
			expect(Array.isArray(elem.values)).toBe(true);
			expect(elem.values.length).toBe(problem.elementLength());
			elem.values.forEach(function (value) {
				expect(value).not.toBeLessThan(0);
				expect(value).not.toBeGreaterThan(1);
			});
		}); // it "constructor"
	
		it("hamming distance", function () {
			var hammingDistance = Element.prototype.hammingDistance;
			expect(hammingDistance).toBeOfType('function');
			expect(hammingDistance([0,1,2], [0,1,2])).toBe(0);
			expect(hammingDistance([0,1,2], [])).toBe(0);
			expect(hammingDistance([], [0,1,2])).toBe(0);
			expect(hammingDistance([], [])).toBe(0);
			var elem = [0,1,2,3,4,5],  // Bulk test.
				changed, changeCount;
			for (var i = 0, count = 1 << elem.length; i < count; i++) {
				changed = elem.slice();
				changeCount = 0;
				for (var j = 0; j < elem.length; j++) {
					if (i & (1 << j)) {
						changed[j] = 'a';
						changeCount++;
					}
				}
				expect(hammingDistance(elem, changed)).toBe(changeCount);
				expect(hammingDistance(elem.join(''), changed.join(''))).toBe(changeCount);
			}
		}); // it "hamming distance"
	
		it("manhattan distance", function () {
			var manhattanDistance = Element.prototype.manhattanDistance;
			expect(manhattanDistance).toBeOfType('function');
			expect(manhattanDistance([0,1,2], [0,1,2])).toBe(0);
			expect(manhattanDistance([0,1,2], [])).toBe(0);
			expect(manhattanDistance([], [0,1,2])).toBe(0);
			expect(manhattanDistance([], [])).toBe(0);
			
			expect(manhattanDistance([0,1], [0,2])).toBe(1);
			expect(manhattanDistance([1,0], [2,0])).toBe(1);
			expect(manhattanDistance([0,1], [0,-1])).toBe(2);
			expect(manhattanDistance([1,0], [-1,0])).toBe(2);
			expect(manhattanDistance([0,1,0], [1,1,1])).toBe(2);
			expect(manhattanDistance([0,0,0], [1,1,1])).toBe(3);
		}); // it "manhattan distance"
	
		it("euclidean distance", function () {
			var euclideanDistance = Element.prototype.euclideanDistance;
			expect(euclideanDistance).toBeOfType('function');
			expect(euclideanDistance([0,1,2], [0,1,2])).toBe(0);
			expect(euclideanDistance([0,1,2], [])).toBe(0);
			expect(euclideanDistance([], [0,1,2])).toBe(0);
			expect(euclideanDistance([], [])).toBe(0);
			
			expect(euclideanDistance([0,0], [1,1])).toBe(Math.sqrt(2));
			expect(euclideanDistance([0,0], [0,1])).toBe(1);
			expect(euclideanDistance([0,0], [1,0])).toBe(1);
			expect(euclideanDistance([-1,-1], [1,1])).toBe(Math.sqrt(8));
		}); // it "euclidean distance"
		
		it("root mean squared error", function () {
			var rootMeanSquaredError = Element.prototype.rootMeanSquaredError;
			expect(rootMeanSquaredError).toBeOfType('function');
			function plus1(x) {
				return x + 1;
			}
			expect(rootMeanSquaredError(plus1, [])).toBe(0);
			expect(rootMeanSquaredError(plus1, [[1,0]])).toBe(0);
			expect(rootMeanSquaredError(plus1, [[1,0],[2,1],[3,2]])).toBe(0);
			expect(rootMeanSquaredError(plus1, [[1,1]])).toBe(1);
			expect(rootMeanSquaredError(plus1, [[1,1],[2,2]])).toBe(1);
			expect(rootMeanSquaredError(plus1, [[1,2],[2,3]])).toBe(2);
			expect(rootMeanSquaredError(plus1, [[3,0],[4,1]])).toBe(2);
			expect(rootMeanSquaredError(plus1, [[1,2],[2,2]])).toBe(Math.sqrt(5/2));
		}); // it "root mean squared error"
	}); //// describe "Element"
}); //// define.