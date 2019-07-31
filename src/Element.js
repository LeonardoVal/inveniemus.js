/**  
 */
const DEFAULT_MODEL = (new Array(10)).fill({ n: 128 });

/**	Elements are representations of [candidate solutions](http://en.wikipedia.org/wiki/Feasible_region)
 * in a search or optimization problem.
 * 
 * @see Problem
 */
class Element {
	/** All elements are defined by a `problem`, an array of numbers (i.e. the element's `values`,
	random numbers by default) and an `evaluation` (`NaN` by default). The element's values are
	coerced to be in the range provided by the problem's element model.

	The `values` store all data about the candidate solution this element represents. This may
	appear to abstract and stark, but it helps to separate the problem definition from the search
	or optimization strategy.

	The element's `evaluation` is a numerical assessment of the represented candidate solution.
	Usually is a measure of how well the problem is solved, or how close the element is to a real
	solution. It guides almost all of the metaheuristics.
	*/
	constructor(values = null, evaluation = null) {
		this.__values__ = !values ? this.randomValues() : this.checkValues(values, false);
		this.__evaluation__ = evaluation;
	}

	/** An element's model is an array that defines the ranges for each of the 
	 * element's value.
	 * 
	 * @property {object[]}
	 * @example <caption>A model for 10 values with 2^32 possible values each</caption>
	 * 	(new Array(10)).fill({ n: Math.pow(2,32) })
	 */
	static get model() {
		throw new Error(`Element.model is not implemented! Please override.`);
	}

	/** The `ArrayType` is the internal representation of the elements' 
	 * `values`. It is `Uint32Array` by default.
	 * 
	 * @property {class}
	*/
	static get ArrayType() {
		return Uint32Array;
	}

	/** Return a random number between 0 (inclusively) and 1 (exclusively). By 
	 * default uses the standard `Math.random` function.
	 * 
	 * @returns {number}
	 */
	get __random__() {
		return Math.random();
	}

	/** Generates a random value according to the given model.
	 * 
	 * @param {object} i - The value's model.
	 * @returns {integer}
	 */
	randomValue(valueModel) {
		return Math.floor(this.__random__() * valueModel.n);
	}

	/** Generates an array of random values consistent with this element's
	 * model.  
	 *
	 * @returns {number[]}
	 */
	randomValues() {
		let values = this.model.map((valueModel, i) => {
				this.randomValue(valueModel);
			});
		return new this.constructor.ArrayType(values);
	}

	/** TODO
	 * 
	 */
	get evaluation() {
		return this.__evaluation__;
	}
	set evaluation(eval) {
		if (Array.isArray(eval)) {
			this.__evaluation__ = eval.map((v) => +v);
		} else if (!isNaN(eval) && eval !== null) {
			this.__evaluation__ = [+eval];
		} else {
			throw new TypeError(`Evaluation cannot be ${ eval }!`);
		}
	}
	
	/** Checks if all given `values` are within the range defined by this 
	 * element's model. If `coerce` is false any invalid values raises an
	 * error. Else values are coerced to fit the element's model.
	 * 
	 * @param {number[]} values
	 * @param {boolean} [coerce=false]
	 * @returns {number[]}
	 * @throws {TypeError} If the values are NaN or out of range, and cannot be
	 * 	coerced. 
	*/
	checkValues(values, coerce) {
		let checkedValues = this.constructor.model.map((valueModel, i) => {
			let v = values[i],
				n = valueModel.n;
			if (isNaN(v)) {
				if (coerce) {
					return 0;
				} else {
					throw new TypeError(`Value #${ i } (${ v }) is NaN!`);
				}
			} else if (v < 0 || v >= n) {
				if (coerce) {
					return v < 0 ? 0 : n - 1;
				} else {
					throw new TypeError(`Value #${ i} (${ v }) is out of range [0,${ n-1 }]!`);
				}
			} else {
				return v;
			}
		});
		return new this.ArrayType(checkedValues);
	}

	/** It is usually more convenient to have the `values` in an instance of 
	 * `Array` than an instance of a typed array.
	 * 
	 * @returns {number[]}
	 */
	values() {
		return Array.prototype.slice.call(this.__values__);
	}

	/** Every element is iterable. The iterator goes over its values. 
	 * 
	 * @returns {iterator<number>}
	 */
	[Symbol.iterator]() {
		return this.__value__[Symbol.iterator]();
	}

	/** Indicates whether this element is an actual solution or not.
	 * 
	 * @returns {boolean}
	 * @abstract 
	 */
	suffices() {
		throw new Error(`Element.suffices is not implemented! Please override.`);
	}

	/** The `emblem` of an element is a string that represents it and can be 
	 * displayed to the user. By default returns a custom string 
	 * representation.
	 * 
	 * @returns {string}
	 */
	emblem() {
		return `[Element [${ 
				JSON.stringify(this.__values__) 
			}] ${ 
				JSON.stringify(this.__evaluation__) 
			}]`;
	}

	/** The default string representation of an Element is its `emblem`.
	 * 
	 * @returns {string}
	*/
	toString() {
		return this.emblem();
	}

	// Evaluations ////////////////////////////////////////////////////////////

	/** Calculates this element's evaluation. This can be interpreted as the 
	 * solution's cost in a search problem or the target function of an 
	 * optimization problem.
	 * 
	 * @returns {number|number[]}
	 * @abstract
	 */
	evaluate() {
		throw new Error(`Element.evaluate is not implemented! Please override.`);
	}

	/** The [Hamming distance](http://en.wikipedia.org/wiki/Hamming_distance) 
	 * between two arrays is equal to the number of positions at which 
	 * corresponding values are different. Elements are assumed to be of the 
	 * same length. If they are not, only the common parts are considered.
	 * 
	 * @param {iterable} elem1
	 * @param {iterable} elem2
	 * @returns {integer}
	 */
	hammingDistance(elem1, elem2) {
		let count = 0,
			array1 = [...elem1],
			array2 = [...elem2],
			length = Math.min(array1.length, array2.length);
		for (let i = 0; i < length; i++) {
			if (array1[i] !== array2[i]) {
				count++;
			}
		}
		return count; //FIXME Add difference in length
	}

	/** The [Manhattan distance](http://en.wikipedia.org/wiki/Manhattan_distance) 
	 * between two arrays is the sum of the absolute differences of 
	 * corresponding positions.
	 * 
	 * @param {iterable} elem1
	 * @param {iterable} elem2
	 * @returns {number}
	 */
	manhattanDistance(elem1, elem2) {
		let sum = 0,
			array1 = [...elem1],
			array2 = [...elem2],
			length = Math.min(array1.length, array2.length);
		for (let i = 0; i < length; i++) {
			sum += Math.abs(array1[i] - array2[i]);
		}
		return sum;
	}

	/** The [euclidean distance](http://en.wikipedia.org/wiki/Euclidean_distance)
	 * between two arrays is another option for evaluation.
	 *
	 * @param {iterable} elem1
	 * @param {iterable} elem2
	 * @returns {number}
	 */
	euclideanDistance(elem1, elem2) {
		let sum = 0,
			array1 = [...elem1],
			array2 = [...elem2],
			length = Math.min(array1.length, array2.length);
		for (let i = 0; i < length; i++) {
			sum += Math.pow(array1[i] - array2[i], 2);
		}
		return Math.sqrt(sum);
	}

	/** Another common evaluation is the [root mean squared error](http://en.wikipedia.org/wiki/Root_mean_squared_error).
	 * The method takes a function `fn` (usually a mapping of this element) and
	 * some `data`. This `data` must be an iterable of arrays, in which the 
	 * first element is the expected result and the rest are the arguments for 
	 * the function.
	 * 
	 * @param {function(any[]):number} fn
	 * @param {iterable<number[]>} data
	 * @returns {number}
	 */
	rootMeanSquaredError(fn, data) {
		let length = 0,
			error = 0;
		for (let datum of data) {
			length++;
			let diff = datum[0] - fn.apply(this, datum.slice(1));
			error += Math.pow(diff, 2);
		}
		return length === 0 ? 0 : Math.sqrt(error / length);
	}

	/** Finding out if this element is better than `other`. By default uses the 
	 * problem's `compare` method.
	 * 
	 * @param {Element} other
	 * @returns {boolean} 
	 */
	isBetterThan(other) {
		return this.problem.compare(this, other) > 0;
	}

	// Expansions /////////////////////////////////////////////////////////////

	/** An element's `neighbourhood` is a set of new elements, with values 
	 * belonging to the n-dimensional ball around this element's values with 
	 * the given `radius`.
	 * 
	 * @param {number} [radius=1]
	 * @yields {Element}
	 */
	*neighbourhood(radius = 1) {
		let model = this.model,
			values = this.__values__,
			length = values.length;
		radius = isNaN(radius) ? 1 : +radius;
		for (let i = 0; i < length; i++) {
			let value = values[i],
				n = model[i].n;
			if (value > 0) {
				yield this.modification(i, Math.max(0, value - d));
			}
			if (value < n - 1) {
				yield this.modification(i, Math.min(n - 1, value + d));
			}
		}
	}

	/** Returns a new and unevaluated copy of this element, with its values 
	 * modified as specified. Values are always coerced to the element's model.
	 * 
	 * @param {integer} position
	 * @param {number} newValue
	 * @returns {Element}
	*/
	modification() {
		let newValues = this.__values__.slice();
		for (let i = 0; i < arguments.length; i += 2) {
			let pos = arguments[i] |0;
			newValues[pos] = clamp(arguments[i + 1], 0, this.model[i].n - 1);
		}
		return new this.constructor(newValues);
	}

	// Mappings ///////////////////////////////////////////////////////////////

	/** Usually a numbers array is just too abstract to handle, and another 
	 * representation of the candidate solution must be build. The `mapping()` 
	 * method returns an alternate representation of this element that may be 
	 * fitter for evaluation or showing it to the user. 
	 * 
	 * By default it just returns the `element`s values normalized.
	 * 
	 * @returns {any}
	 */
	mapping() {
		return this.normalizedValues();
	}

	/** A range mapping builds an array of equal length of this element's 
	 * `values`. Each value is translated from the element model's range to 
	 * the given range.
	 * 
	 * @param {...number[]}
	 * @returns {number[]}
	 * @throws {Error} If no ranges are given.
	*/
	rangeMapping(...ranges) {
		let model = this.model,
			lastRange = ranges[ranges.length - 1];
		if (ranges.length < 1) {
			throw new Error(`No ranges given for range mapping!`);
		}
		return Array.prototype.map.call(this.__values__, (v, i) => {
			let n = model[i].n,
				rangeTo = ranges.length > i ? ranges[i] : lastRange;
			v = v / n * (rangeTo[1] - rangeTo[0]) + rangeTo[0];
			return clamp(v, rangeTo[0], rangeTo[1]);
		});
	}

	/** This element's values mapped to the range [0,1].
	 * 
	 * @returns {number[]}
	 */
	normalizedValues() {
		return this.rangeMapping([0, 1]);
	}

	/** An array mapping builds an array of equal length of this element's 
	 * `values`. Each value is used to index the corresponding items argument. 
	 * If there are less arguments than the element's `length`, the last one is 
	 * used for the rest of the values.
	 * 
	 * @param {...any[]} itemArrays
	 * @returns {any[]}
	 * @throws {Error} If no item arrays are given.
	*/
	arrayMapping(...itemArrays) {
		let lastItems = itemArrays[itemArrays.length - 1],
			model = this.model;
		if (itemArrays.length < 1) {
			throw new Error(`No value arrays given for array mapping!`);
		}
		return Array.prototype.map.call(this.__values__, (v, i) => {
			let items = itemArrays.length > i ? itemArrays[i] : lastItems,
				n = model[i].n,
				index = Math.floor(v / n * items.length);
			return items[index];
		});
	}

	/** A set mapping builds an array of equal length of this element's 
	 * `values`. Each value is used to select one item. Items are not selected 
	 * more than once.
	 * 
	 * @param {any[][]} items
	 * @param {boolean} [full=false]
	 * @returns {any[]}
	 * @throws {Error} If the number of items does not match the length of the
	 * 	element.
	 */
	setMapping(items, full = false) {
		items = items.slice(); // Shallow copy.
		let result = this.normalizedValues().map( (v, i) => {
			if (items.length < 1) {
				throw new Error(`Insufficient elements for set mapping!`);
			}
			let index = clamp(Math.floor(v * items.length), 0, items.length - 1);
			return items.splice(index, 1)[0];
		});
		if (full) {
			if (items.length !== 1) { 
				throw new Error(`Wrong amount of elements in set mapping!`);
			}
			result.push(items[0]);
		}
		return result;
	}

	// Other utilities ////////////////////////////////////////////////////////

	/** Makes a copy of this element.
	 * 
	 * @returns {Element}
	 */
	clone() {
		return new this.constructor(this.__values__, this.evaluation);
	}

	/** Two elements can be compared with `equals(other)`. It checks if the 
	 * other element has the same values and constructor than this one.
	 * 
	 * @param {any} other
	 * @returns {boolean}
	*/
	equals(other) {
		if (this.constructor === other.constructor &&
				this.__values__.length === other.__values__.length) {
			let length = this.__values__.length;
			for (let i = 0; i < length; i++) {
				if (this.__values__[i] !== other.__values__[i]) {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	/** @ignore */
	static get __SERMAT__() { //FIXME
		return {
			identifier: 'Element',
			serializer: function serialize_Element(obj) {
				return [obj.problem, obj.values(), obj.evaluation];
			},
			materializer: function materialize_Element(obj, args) {
				return !args ? null : new args[0].Element(args[1], args[2]);
			}
		};
	}
} // class Element.

exports.Element = Element;