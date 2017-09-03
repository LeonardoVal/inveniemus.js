define(['creatartis-base', 'sermat', 'inveniemus'], function (base, Sermat, inveniemus) {
	var Element = inveniemus.Element,
		Problem = inveniemus.Problem;

// Evaluation utilities. ///////////////////////////////////////////////////////
	describe('Element', function () {
		it("constructor", function () {
			var problem = new Problem();
			expect(typeof problem.Element).toBe('function');
			var elem = new problem.Element();
			expect(elem instanceof problem.Element).toBe(true);
			expect(elem instanceof Element).toBe(true);
			expect(typeof elem.ArrayType).toBe('function');
		}); // it "constructor"

		it("type of values", function () {
			function checkValues(elem, ArrayType) {
				var model = elem.model;
				expect(elem.__values__ instanceof ArrayType).toBe(true);
				expect(elem.__values__.length).toBe(model.length);
				var values = elem.values();
				expect(values instanceof Array).toBe(true);
				expect(values.length).toBe(model.length);
				elem.__values__.forEach(function (value, i) {
					expect(value).not.toBeLessThan(0);
					expect(value).toBeLessThan(model[i].n);
					expect(values[i]).toBe(value);
				});
			}

			var problem = new Problem();
			expect(problem.Element.prototype.ArrayType).toBe(Uint32Array);
			checkValues(new problem.Element(), Uint32Array);
			[Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array,
				Float32Array, Float64Array].forEach(function (ArrayType) {
					problem.Element.prototype.ArrayType = ArrayType;
					checkValues(new problem.Element(), ArrayType);
				});
		}); // it "values"

		it("evaluation", function () {
			var problem = new Problem(),
				elem = new problem.Element();
			expect(elem.evaluation).toBe(null);
			elem.evaluation = 77;
			expect(JSON.stringify(elem.evaluation)).toBe('[77]');
			elem.evaluation = [1,2];
			expect(JSON.stringify(elem.evaluation)).toBe('[1,2]');
			elem.evaluation = 'abc';
			expect(elem.evaluation).toBe(null);
			elem.evaluation = undefined;
			expect(elem.evaluation).toBe(null);
		}); // it "evaluation"

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

		it("serialization", function () {
			var sermat = new Sermat({ mode: Sermat.CIRCULAR_MODE }),
				problem = new Problem(),
				elem = new problem.Element();
				elem2 = new problem.Element();
				elems = sermat.sermat([elem, elem, elem2]);
			expect(elems[0]).not.toBe(elem);
			expect(elems[0].constructor).not.toBe(elem.constructor);
			expect(elems[0].problem).not.toBe(elem.problem);
			expect(elems[0].values).toBe(elem.values);
			expect(elems[0].evaluation).toBe(elem.evaluation);

			expect(elems[1]).toBe(elems[0]);
			expect(elems[2]).not.toBe(elems[0]);
			expect(elems[2].constructor).toBe(elems[0].constructor);
			expect(elems[2].problem).toBe(elems[0].problem);
		}); // it "serialization"
	}); //// describe "Element"
}); //// define.
