/** # Distribution estimation

This is a simple implementation of a [estimation of distributionalgorithm]
(http://en.wikipedia.org/wiki/Estimation_of_distribution_algorithm). This stochastic optimization 
methods try to estimate a probabilistic model for the characteristics of the better candidate 
solutions. At each step many individual are randomly generated based on the current model. After all
have been evaluated, the model is adjusted.

The statistical model in this implementation is an histogram for each dimension (i.e. value of the
element representing the candidate solution). Dimensions are assumed to be independent of each 
other.
*/
var DistributionEstimation = metaheuristics.DistributionEstimation = declare(Metaheuristic, {
	/** The constructor takes the following parameters:
	*/
	constructor: function DistributionEstimation(params) {
		Metaheuristic.call(this, params);
		initialize(this, params)
			/** + `histogramWidth=10` is the amounts of ranges the value domain is split in order
			to calculate the histograms.
			*/
			.integer('histogramWidth', { coerce: true, defaultValue: 10, minimum: 2 });
	},
	
	/** New elements to add to the state in the `expansion` are build from the `histograms`
	calculated from said state.
	*/
	expansion: function expansion(size) {
		var mh = this,
			expansionRate = isNaN(this.expansionRate) ? 0.5 : +this.expansionRate,
			histograms = this.histograms(); // Get the current histogram of the state.
		size = isNaN(size) ? Math.floor(expansionRate * this.size) : size |0;
		return base.Iterable.repeat(null, size).map(function () {
			return mh.elementFromHistograms(histograms);
		}).toArray();
	},
	
	/** The `histograms` have the frequencies of value ranges in the current state.
	*/
	histograms: function histograms() {
		return DistributionEstimation.histograms(this.state, this.histogramWidth, 
			this.problem.elementModel().length);
	},
	
	'static histograms': function histograms(state, histogramWidth, histogramCount) {
		var size = state.length,
			counts = Iterable.iterate(function (v) { // Builds a matrix of zeroes.
				return v.slice();
			}, Iterable.repeat(0, histogramWidth).toArray(), histogramCount).toArray();
		state.forEach(function (element) {
			element.values.forEach(function (value, i) {
				var bar = Math.min(histogramWidth - 1, Math.floor(element.values[i] * histogramWidth)); //FIXME Normalize.
				counts[i][bar]++;
			});
		});
		return counts.map(function (v) { // Turn counts into frequencies.
			return v.map(function (v) {
				return v / size;
			}); 
		});
	},
	
	/** The method `elementFromHistogram` is used to make these new random elements.
	*/
	elementFromHistograms: function elementFromHistogram(histograms) {
		return DistributionEstimation.elementFromHistograms(histograms, this.problem, this.random);
	},
	
	'static elementFromHistograms': function elementFromHistogram(histograms, problem, random) {
		var length = histograms.length,
			values = new Array(length),
			histogram, r;
		for (var i = 0; i < length; ++i) {
			histogram = histograms[i];
			r = random.random();
			for (var j = 0; j <= histogram.length; ++j) {
				if (j === histogram.length || (r -= histogram[j]) <= 0) {
					values[i] = Math.min(1, Math.max(0, (j + random.random()) / histogram.length));
					break;
				}
			}
		}
		return problem.newElement(values);
	},
	
	// ## Estimation of distribution as a problem. #################################################
	
	/** A `histogramProblem` is the problem of finding histograms that would generate good candidate
	solutions for a given `problem`.
	*/
	'static histogramProblem': function histogramProblem(problem, size, histogramWidth) {
		size = isNaN(size) ? 30 : Math.max(1, size |0);
		histogramWidth = isNaN(histogramWidth) ? 10 : Math.max(2, histogramWidth |0);
		var elementLength = problem.elementLength(),
			elementFromHistograms = this.elementFromHistograms;
			HistogramProblem = declare(Problem, {
				/** Each element of this problem represents an histogram for elements of the given
				`problem`. The argument `histogramWidth` defines how many ranges each histogram has.
				*/
				elementLength: function elementLength() {
					return elementLength * histogramWidth;
				},
				
				/** The evaluation of the elements is the average evaluation of `size` elements 
				generated from the histogram that this element represents.
				*/
				evaluation: function evaluation(element) {
					var histograms = this.mapping(element),
						elements = base.Iterable.repeat(null, size).map(function () {
							return elementFromHistograms(histograms, problem, problem.random);
						});
					return Future.all(iterable(elements).map(function (e) {
						return Future.when(e.evaluate());
					})).then(function (evaluations) {
						return iterable(evaluations).sum() / evaluations.length;
					});
				},
				
				/** The `mapping` simply assembles the histograms and normalizes its frequencies.
				*/
				mapping: function mapping(element) {
					var histograms = [],
						histogram, sum;
					for (var i = 0; i < element.length; ++i) {
						histogram = element.values.slice(i * histogramWidth, (i+1) * histogramWidth);
						sum = iterable(histogram).sum();
						histograms[i] = histogram.map(function (f) { // Normalization
							return f / sum;
						});
					}
					return histograms;
				},
				
				/** The comparison function is the same as the original problem's.
				*/
				compare: problem.compare
			});
		return new HistogramProblem({ random: problem.random });
	},
	
	// ## Other ####################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'DistributionEstimation',
		serializer: function serialize_DistributionEstimation(obj) {
			return [obj.__params__('histogramWidth')];
		}
	}
}); // declare DistributionEstimation.
