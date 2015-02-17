/** # Test beds

Problem builder for test beds of algorithms in this library.
*/

/** The function `testbed` is a shortcut used to define the test problems.
*/
var testbed = problems.testbed = function testbed(spec) {
	var minimumValue = isNaN(spec.minimumValue) ? -1e6 : +spec.minimumValue,
		maximumValue = isNaN(spec.maximumValue) ? +1e6 : +spec.maximumValue;
	return new Problem({
		title: spec.title +"",
		description: spec.description +"",
		
		/** The representation of all testbeds must override the evaluation of the candidate 
		solutions. The `length` is 2 by default.
		*/
		representation: declare(Element, {
			length: isNaN(spec.length) ? 2 : +spec.length,				
				
			evaluate: function evaluate() {
				return this.evaluation = spec.evaluation(this.rangeMapping([minimumValue, maximumValue]));
			}
		}),
		
		/** The optimization type is defined by `spec.target`. Minimization is assumed by default.
		*/
		compare: !spec.hasOwnProperty('target') || spec.target === -Infinity ? Problem.prototype.minimization
			: spec.target === Infinity ? Problem.prototype.maximization 
			: function compare(e1, e2) {
				return this.approximation(spec.target, e1, e2);
			},
		
		/** If an optimum value is provided (`spec.optimumValue`) it is added to the termination
		criteria.
		*/
		suffices: spec.hasOwnProperty('optimumValue') ? function suffices(elements) {
			var best = elements[0];
			return Math.abs(best.evaluation - spec.optimumValue) < best.resolution;
		} : Problem.prototype.suffices,
	});
}; // problems.testbed()

/** Testbed problems taken from the web (e.g. 
[1](http://en.wikipedia.org/wiki/Test_functions_for_optimization),
[2](http://www.sfu.ca/~ssurjano/optimization.html), 
[3](http://www-optima.amp.i.kyoto-u.ac.jp/member/student/hedar/Hedar_files/TestGO.htm)
).
*/
problems.testbeds = {
	/** The [Ackley's function](http://www.sfu.ca/~ssurjano/ackley.html) (in 2 dimensions) has an
	global optimum surrounded by an outer region that is rather flat, yet with many local optima. 
	*/
	Ackley: function Ackley(length, a, b, c) {
		a = isNaN(a) ? 20 : +a;
		b = isNaN(b) ? 0.2 : +b;
		c = isNaN(c) ? 2 * Math.PI : +c;
		return testbed({
			length: length,
			target: -Infinity,
			minimumValue: -32.768, 
			maximumValue: +32.768,			
			optimumValue: 0,			
			evaluation: function evaluation(vs) {
				var term1 = 0, term2 = 0, d = vs.length, v;
				for (var i = 0; i < d; ++i) {
					v = vs[i];
					term1 += v * v;
					term2 += Math.cos(c * v);
				}
				return -a * Math.exp(-b * Math.sqrt(term1 / d)) - Math.exp(term2 / d) + a + Math.exp(1);
			}
		});
	},

	/** The cross-in-tray is a function with many local optima, both minima and maxima. If minimized
	it has 4 global minima.
	*/
	crossInTray: function crossInTray(target) {
		target = isNaN(target) ? -Infinity : +target;
		return testbed({
			length: 2,
			target: target,
			minimumValue: -10,
			maximumValue: +10,
			evaluation: function evaluation(vs) {
				var x = vs[0], y = vs[1];
				return -0.0001 * Math.pow(
					Math.abs(Math.sin(x) * Math.sin(y) * Math.exp(Math.abs(100 - Math.sqrt(x*x + y*y) / Math.PI))) + 1,
					0.1);
			}			
		});
	},
	
	/** The [Griewank function](http://www.sfu.ca/~ssurjano/griewank.html) has many local optima
	regularly distributed.
	*/
	Griewank: function Griewank(length) {
		return testbed({
			length: length,
			minimumValue: -600,
			maximumValue: +600,
			optimumValue: 0,
			evaluation: function evaluation(vs) {
				var sum = 0, prod = 1, len = vs.length, v;
				for (var i = 0; i < len; ++i) {
					v = vs[i];
					sum += v * v / 4000;
					prod *= Math.cos(v / Math.sqrt(i+1));
				}
				return sum - prod + 1;
			}			
		});
	},
	
	/** The [Levy function](http://www.sfu.ca/~ssurjano/levy.html) is multimodal, with some 
	difficult local minima regions.
	*/
	Levy: function Levy(length) {
		return testbed({
			length: length,
			target: -Infinity,
			minimumValue: -10,
			maximumValue: +10,
			optimumValue: 0,
			evaluation: function evaluation(vs) {
				var sum = 0, d = vs.length, 
					w1 = 1 + (vs[0] - 1) / 4, wd = 1 + (vs[d-1] - 1) / 4, w;
				for (var i = 1; i < d - 1; ++i) {
					w = 1 + (vs[i] - 1) / 4;
					sum += Math.pow(w - 1, 2) * (1 + 10 * Math.pow(Math.sin(Math.PI * w + 1), 2));
				}
				return Math.pow(Math.sin(Math.PI * w1), 2) + sum
					+ Math.pow(wd - 1, 2) * (1 + Math.pow(Math.sin(2 * Math.PI * wd), 2));
			}
		});
	},
	
	/** The [Michalewicz function](http://www.sfu.ca/~ssurjano/michal.html) is a multimodal function
	with a number local minima equal to the factorial of the number of dimensions; and it has steep 
	valleys and ridges.
	*/
	Michalewicz: function Michalewicz(length, m) {
		m = isNaN(m) ? 10 : +m;
		return testbed({
			length: length,
			target: -Infinity,
			minimumValue: 0,
			maximumValue: Math.PI,
			evaluation: function evaluation(vs) {
				var sum = 0, d = vs.length, v;
				for (var i = 0; i < d; ++i) {
					v = vs[i];
					sum += Math.sin(v) * Math.pow(Math.sin((i+1) * v * v / Math.PI), 2 * m);
				}
				return -sum;
			}
		});
	},
	
	/** [Perm(0,d,beta) function](http://www-optima.amp.i.kyoto-u.ac.jp/member/student/hedar/Hedar_files/TestGO_files/Page2545.htm).
	*/
	perm0: function perm0(d, beta) {
		d = isNaN(d) ? 2 : Math.min(1, d|0);
		beta = isNaN(beta) ? 0 : +beta;
		return testbed({
			length: d,
			target: -Infinity,
			minimumValue: -d,
			maximumValue: +d,
			optimumValue: 0,
			evaluation: function evaluation(vs) {
				var sum1 = 0, sum2, v;
				for (var i = 0; i < d; ++i) {
					sum2 = 0;
					for (var j = 0; j < d; ++j) {
						sum2 += (j+1 + beta) * (Math.pow(vs[j], i+1) - Math.pow(1 / (j+1), i+1));
					}
					sum1 += sum2 * sum2;
				}
				return sum1;
			}
		});
	},
	
	/** The [Rastrigin function](http://www.sfu.ca/~ssurjano/rastr.html) is highly multimodal yet
	local minima are regularly distributed.
	*/
	Rastrigin: function Rastrigin(length) {
		return testbed({
			length: length,
			target: -Infinity,
			minimumValue: -5.12,
			maximumValue: +5.12,
			optimumValue: 0,
			evaluation: function evaluation(vs) {
				var result = 0, d = vs.length, v;
				for (var i = 0; i < d; ++i) {
					v = vs[i];
					result += v * v - 10 * Math.cos(2 * Math.PI * v);
				}
				return 10 * d + result;
			}
		});
	},
	
	/*** The [Rosenbrock function](http://en.wikipedia.org/wiki/Rosenbrock_function) is a function 
	used as a performance test problem for optimization algorithms introduced by Howard H. 
	Rosenbrock in 1960. The global minimum is inside a long, narrow, parabolic shaped flat valley. 
	To find the valley is trivial, yet to converge to the global minimum (zero) is difficult.
	*/
	Rosenbrock: function Rosenbrock(length, a, b) {
		a = isNaN(a) ? 1 : +a;
		b = isNaN(b) ? 100 : +b;
		return testbed({
			length: length,
			target: -Infinity,
			optimumValue: 0,
			evaluation: function evaluation(vs) {
				var result = 0;
				for (var i = 1; i < vs.length; ++i) {
					result += b * Math.pow(vs[i-1] * vs[i-1] - vs[i], 2) + Math.pow(vs[i-1] - a, 2);
				}
				return result;
			}
		});
	},
	
	/** The [Schwefel function](http://www.sfu.ca/~ssurjano/schwef.html) is a complex test with many
	local optima.
	*/
	Schwefel: function Schwefel(length) {
		return testbed({
			length: length,
			target: -Infinity,
			minimumValue: -500,
			maximumValue: +500,
			optimumValue: 0,
			evaluation: function evaluation(vs) {
				var result = 0, d = vs.length, v;
				for (var i = 0; i < d; ++i) {
					v = vs[i];
					result += v * Math.sin(Math.sqrt(Math.abs(v)));
				}
				return 418.9829 * d - result;
			}
		});
	},
	
	/** The [sphere function](http://www.sfu.ca/~ssurjano/spheref.html) minimizes the sum of the
	squares for every value in the input vector. It has as many local minima as dimensions the
	search space has, but still only one global minimum (zero). 
	*/
	sphere: function sphere(length) {
		return testbed({
			length: length,
			target: -Infinity,
			optimumValue: 0,
			evaluation: function evaluation(vs) {
				var result = 0;
				for (var i = 0; i < vs.length; ++i) {
					result += vs[i] * vs[i];
				}
				return result;
			}
		});
	},
	
	/** A very simple class of problems that deal with optimizing the sum of the elements' values. 
	Probably the simplest optimization problem that can be defined. It has no local optima, and it
	draws a simple and gentle slope towards to global optimum.
	*/
	sumOptimization: function sumOptimization(length, target) {
		length = isNaN(length) ? 2 : Math.max(1, length|0);
		target = isNaN(target) ? -Infinity : +target;
		return testbed({
			length: length,
			target: target,
			minimumValue:  0,
			maximumValue: +1,
			optimumValue: target === -Infinity ? 0 : target === +Infinity ? length : target,
			evaluation: function evaluation(vs) {
				var result = 0, len = vs.length;
				for (var i = 0; i < len; ++i) {
					result += vs[i];
				}
				return result;
			}
		});
	}
}; // problems.testbeds