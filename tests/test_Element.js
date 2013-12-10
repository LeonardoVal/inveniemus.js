/** inveniemus/tests/test_Element.js:
	Test cases for Element type of the Inveniemus library.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
define(['basis', 'inveniemus'], function (basis, inveniemus) {
	var verifier = new basis.Verifier();
	var Element = inveniemus.Element;

// Evaluation utilities. ///////////////////////////////////////////////////////

	verifier.test("Element.hammingDistance()", function () {
		var hammingDistance = Element.prototype.hammingDistance;
		this.assertIsFunction(hammingDistance);
		this.assertEqual(0, hammingDistance([0,1,2], [0,1,2]));
		this.assertEqual(0, hammingDistance([0,1,2], []));
		this.assertEqual(0, hammingDistance([], [0,1,2]));
		this.assertEqual(0, hammingDistance([], []));
		// Bulk test.
		var elem = [0,1,2,3,4,5], changed, changeCount;
		for (var i = 0, count = 1 << elem.length; i < count; i++) {
			changed = elem.slice();
			changeCount = 0;
			for (var j = 0; j < elem.length; j++) {
				if (i & (1 << j)) {
					changed[j] = 'a';
					changeCount++;
				}
			}
			this.assertEqual(changeCount, hammingDistance(elem, changed));
			this.assertEqual(changeCount, hammingDistance(elem.join(''), changed.join('')));
		}
	}); // Element.hammingDistance()
	
	verifier.test("Element.manhattanDistance()", function () {
		var manhattanDistance = Element.prototype.manhattanDistance;
		this.assertIsFunction(manhattanDistance);
		this.assertEqual(0, manhattanDistance([0,1,2], [0,1,2]));
		this.assertEqual(0, manhattanDistance([0,1,2], []));
		this.assertEqual(0, manhattanDistance([], [0,1,2]));
		this.assertEqual(0, manhattanDistance([], []));
		
		this.assertEqual(1, manhattanDistance([0,1], [0,2]));
		this.assertEqual(1, manhattanDistance([1,0], [2,0]));
		this.assertEqual(2, manhattanDistance([0,1], [0,-1]));
		this.assertEqual(2, manhattanDistance([1,0], [-1,0]));
		this.assertEqual(2, manhattanDistance([0,1,0], [1,1,1]));
		this.assertEqual(3, manhattanDistance([0,0,0], [1,1,1]));
	}); // Element.manhattanDistance()
	
	verifier.test("Element.euclideanDistance()", function () {
		var euclideanDistance = Element.prototype.euclideanDistance;
		this.assertIsFunction(euclideanDistance);
		this.assertEqual(0, euclideanDistance([0,1,2], [0,1,2]));
		this.assertEqual(0, euclideanDistance([0,1,2], []));
		this.assertEqual(0, euclideanDistance([], [0,1,2]));
		this.assertEqual(0, euclideanDistance([], []));
		
		this.assertEqual(Math.sqrt(2), euclideanDistance([0,0], [1,1]));
		this.assertEqual(1, euclideanDistance([0,0], [0,1]));
		this.assertEqual(1, euclideanDistance([0,0], [1,0]));
		this.assertEqual(Math.sqrt(8), euclideanDistance([-1,-1], [1,1]));
	}); // Element.euclideanDistance()
	
	verifier.test("Element.rootMeanSquaredError()", function () {
		var rootMeanSquaredError = Element.prototype.rootMeanSquaredError;
		this.assertIsFunction(rootMeanSquaredError);
		function plus1(x) {
			return x + 1;
		}
		this.assertEqual(0, rootMeanSquaredError(plus1, []));
		this.assertEqual(0, rootMeanSquaredError(plus1, [[1,0]]));
		this.assertEqual(0, rootMeanSquaredError(plus1, [[1,0],[2,1],[3,2]]));
		this.assertEqual(1, rootMeanSquaredError(plus1, [[1,1]]));
		this.assertEqual(1, rootMeanSquaredError(plus1, [[1,1],[2,2]]));
		this.assertEqual(2, rootMeanSquaredError(plus1, [[1,2],[2,3]]));
		this.assertEqual(2, rootMeanSquaredError(plus1, [[3,0],[4,1]]));
		this.assertEqual(Math.sqrt(5/2), rootMeanSquaredError(plus1, [[1,2],[2,2]]));
	}); // Element.rootMeanSquaredError()
	
/////////////////////////////////////////////////////////////////////////// Fin.
	return verifier;
});