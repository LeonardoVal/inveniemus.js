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
			.integer('histogramWidth', { coerce: true, defaultValue: 10, minimum: 1 });
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
	histograms: function histograms(state) {
		state || (state = this.state);
		var histogramWidth = this.histogramWidth,
			size = this.state.length,
			emptyCount = base.Iterable.repeat(0, histogramWidth).toArray(),
			length = this.problem.representation.prototype.length,
			counts = base.Iterable.iterate(function (v) {
				return v.slice(); // Shallow copy.
			}, emptyCount, length).toArray();
		state.forEach(function (element) {
			element.values.forEach(function (value, i) {
				var bar = Math.min(histogramWidth - 1, Math.floor(element.values[i] * histogramWidth));
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
	elementFromHistograms: function elementFromHistogram(histograms, representation) {
		representation || (representation = this.problem.representation);
		var length = histograms.length,
			values = new Array(length),
			random = this.random,
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
		return new representation(values);
	},
	
	toString: function toString() {
		return (this.constructor.name || 'DistributionEstimation') +'('+ JSON.stringify(this) +')';
	}
}); // declare DistributionEstimation.
