/** # Gradient descent

[Gradient descent](http://en.wikipedia.org/wiki/Gradient_descent) is an iterative optimization 
method, similar to Hill Climbing. The candidate solution is treated as a point in a multidimensional
search space, and the gradient that the function being optimized defines in said domain is used to
move the current solution in the steepest direction.
*/
var GradientDescent = metaheuristics.GradientDescent = declare(Metaheuristic, {
	/** The constructor takes the following parameters:
	*/
	constructor: function HillClimbing(params) {
		Metaheuristic.call(this, params);
		initialize(this, params)
		/** + `delta=1`: the maximum distance considered by gradient estimators.
		*/
			.number('delta', { coerce: true, defaultValue: 1 })
		/** + `size=1`: the state's size is 1 by default. This may be increased, resulting in many 
		parallel descents.
		*/
			.integer('size', { coerce: true, defaultValue: 1, minimum: 1 });
	},
	
	/** A `gradient` is the vector for the direction of steepest descent (or ascent) of the function 
	to be optimized at the given `element`. If the function is not differentiable an approximation
	can be used. Since estimators may require element evaluation, which can be asynchronous, it must
	be considered that this function may return a future.
	
	The default implementation is based on the finite difference method proposed by [Kiefer and 
	Wolfowitz](http://projecteuclid.org/euclid.aoms/1177729392).
	*/
	gradient: function gradient(element) {
		return this.gradientFiniteDifferences(element);
	},
	
	/** The `rate` is a number by which the gradient is multiplied before adding it to the current 
	point to advance to the next step. The default implementation returns `1/step`, as [Kiefer and 
	Wolfowitz suggest](http://projecteuclid.org/euclid.aoms/1177729392).
	*/
	rate: function rate(step) {
		step = isNaN(step) ? this.step : step |0;
		return 1 / Math.max(1, step);
	},
	
	/** The `estimatorWidth` is a number used by some gradient estimators. By default it returns 
	`step^(-1/3) * delta`, similar to what [Kiefer and Wolfowitz suggest](http://projecteuclid.org/euclid.aoms/1177729392).
	*/
	estimatorWidth: function estimatorWidth(step, delta) {
		step = isNaN(step) ? this.step : step |0;
		delta = isNaN(delta) ? this.delta : +delta;
		return Math.pow(Math.max(1, step), -1/3) * delta;
	},
	
	/** In the `update`, each element in the state is moved in the search domain. The movement is 
	set by its gradient in the direction of the optimization. The distance is defined by the `rate`
	for the current step.
	*/
	update: function update() {
		var mh = this,
			rate = this.rate(this.step);
		return Future.all(this.state.map(function (elem) {
			return Future.then(mh.gradient(elem), function (gradient) {
				var newValues = gradient.map(function (gradientValue, i) {
					return elem.values[i] - gradientValue * rate;
				});
				return mh.problem.newElement(newValues);
			});
		})).then(function (elems) {
			return mh.evaluate(elems);
		}).then(function (elems) {
			mh.state = elems;
			mh.onUpdate();
			return mh;
		});
	},
	
	// ## Gradient estimators ######################################################################
	
	/** A gradient estimator at the given `element` by finite differences.
	*/
	gradientFiniteDifferences: function gradientFiniteDifferences(element, width) {
		width = isNaN(width) ? this.estimatorWidth() : +width;
		var mh = this;
		return Future.all(element.values.map(function (value, i) {
			var left = element.modification(i, value - width),
				right = element.modification(i, value + width);
			return Future.then(left.evaluate(), function (leftEvaluation) {
				return Future.then(right.evaluate(), function (rightEvaluation) {
					var comp = mh.problem.compare(left, right);
					comp = comp === 0 ? comp : comp > 0 ? 1 : -1;
					return (leftEvaluation - rightEvaluation) * comp / 2 / width;
				});
			});
		}));
	},
	
	/** A gradient estimator at the given `element` for [Simultaneous Perturbation Stochastic 
	Approximation](http://www.jhuapl.edu/SPSA/).
	*/
	gradientSimultaneousPerturbation: function gradientSimultaneousPerturbation(width, element) {
		throw new Error('GradientDescent.gradientSimultaneousPerturbation() is not implemented!');//TODO
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'GradientDescent',
		serializer: function serialize_GradientDescent(obj) {
			return [obj.__params__('delta')];
		}
	}
}); // declare GradientDescent.