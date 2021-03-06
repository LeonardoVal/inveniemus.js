﻿/** # Test beds

Problem builder for test beds of algorithms in this library.
*/

/** The function `testbed` is a shortcut used to define the test problems.
*/
var TestBed = problems.TestBed = declare(Problem, {
	constructor: function TestBed(spec) {
		var minimumValue = isNaN(spec.minimumValue) ? -1e6 : +spec.minimumValue,
			maximumValue = isNaN(spec.maximumValue) ? +1e6 : +spec.maximumValue,
			length = isNaN(spec.length) ? 2 : +spec.length;
		Problem.call(this, base.copy({
			title: spec.title,
			elementModel: Iterable.repeat({ n: 2e6 }, length).toArray()
		}, spec));
		this.evaluation = function evaluation(element) {
			return spec.evaluation(element.rangeMapping([minimumValue, maximumValue]));
		};

		/** If an optimum value is provided (`spec.optimumValue`) it is added to the termination
		criteria.
		*/
		if (spec.hasOwnProperty('optimumValue')) {
			this.sufficientElement = function sufficientElement(element) {
				return Math.abs(element.evaluation - spec.optimumValue) < element.resolution;
			};
		}
	}
});

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
		return new TestBed({
			title: "Ackley testbed",
			length: length,
			objectives: -Infinity,
			minimumValue: -32.768,
			maximumValue: +32.768,
			optimumValue: 0,
			evaluation: function evaluation(vs) {
				var term1 = 0,
					term2 = 0,
					d = vs.length,
					v;
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
		return new TestBed({
			title: "cross-in-tray testbed",
			length: 2,
			objectives: target,
			minimumValue: -10,
			maximumValue: +10,
			evaluation: function evaluation(vs) {
				var x = vs[0], y = vs[1];
				return -0.0001 * Math.pow(Math.abs(Math.sin(x) * Math.sin(y) *
					Math.exp(Math.abs(100 - Math.sqrt(x*x + y*y) / Math.PI))) + 1, 0.1);
			}
		});
	},

	/** The [Griewank function](http://www.sfu.ca/~ssurjano/griewank.html) has many local optima
	regularly distributed.
	*/
	Griewank: function Griewank(length) {
		return new TestBed({
			title: "Griewank testbed",
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
		return new TestBed({
			title: "Levy testbed",
			length: length,
			objectives: -Infinity,
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
				return Math.pow(Math.sin(Math.PI * w1), 2) + sum +
					Math.pow(wd - 1, 2) * (1 + Math.pow(Math.sin(2 * Math.PI * wd), 2));
			}
		});
	},

	/** The [Michalewicz function](http://www.sfu.ca/~ssurjano/michal.html) is a multimodal function
	with a number local minima equal to the factorial of the number of dimensions; and it has steep
	valleys and ridges.
	*/
	Michalewicz: function Michalewicz(length, m) {
		m = isNaN(m) ? 10 : +m;
		return new TestBed({
			title: "Michalewicz testbed",
			length: length,
			objectives: -Infinity,
			minimumValue: 0,
			maximumValue: Math.PI,
			evaluation: function evaluation(vs) {
				var sum = 0,
					d = vs.length,
					v;
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
		return new TestBed({
			title: "Perm(0,"+ d +","+ beta +") testbed",
			length: d,
			objectives: -Infinity,
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
		return new TestBed({
			title: "Rastrigin testbed",
			length: length,
			objectives: -Infinity,
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
		return new TestBed({
			title: "Rosenbrock testbed",
			length: length,
			objectives: -Infinity,
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
		return new TestBed({
			title: "Schwefel testbed",
			length: length,
			objectives: -Infinity,
			minimumValue: -500,
			maximumValue: +500,
			optimumValue: 0,
			evaluation: function evaluation(vs) {
				var result = 0,
					d = vs.length,
					v;
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
		return new TestBed({
			title: "sphere testbed",
			length: length,
			objectives: -Infinity,
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
		return new TestBed({
			title: "sum optimization testbed",
			length: length,
			objectives: target,
			minimumValue:  0,
			maximumValue: +1,
			optimumValue: target === -Infinity ? 0 : target === +Infinity ? length : target,
			evaluation: function evaluation(vs) {
				return iterable(vs).sum();
			}
		});
	},

	// ## Multi-objective ##########################################################################

	/** Multiobjective optimization problems taken from [_"Comparison of Multiobjective Evolutionary
	Algorithms: Empirical Results"_ by Zitzler, Deb and Thiele (2000)](http://www.tik.ee.ethz.ch/sop/publicationListFiles/zdt2000a.pdf).
	*/
	ZDT1: function ZDT1(length) {
		length = isNaN(length) ? 30 : Math.max(1, length|0);
		return new TestBed({
			title: "Zitzler-Deb-Thiele function 1",
			length: length,
			objectives: [-Infinity, -Infinity],
			minimumValue:  0,
			maximumValue: +1,
			evaluation: function evaluation(vs) {
				var f1 = vs[0],
					g = iterable(vs).tail().sum() / (vs.length - 1) * 9,
					h = 1 - Math.sqrt(f1 / g);
				return [f1, g * h];
			}
		});
	},

	ZDT2: function ZDT2(length) {
		length = isNaN(length) ? 30 : Math.max(1, length|0);
		return new TestBed({
			title: "Zitzler-Deb-Thiele function 2",
			length: length,
			objectives: [-Infinity, -Infinity],
			minimumValue:  0,
			maximumValue: +1,
			evaluation: function evaluation(vs) {
				var f1 = vs[0],
					g = iterable(vs).tail().sum() / (vs.length - 1) * 9,
					h = 1 - Math.pow(f1 / g, 2);
				return [f1, g * h];
			}
		});
	},

	ZDT3: function ZDT3(length) {
		length = isNaN(length) ? 30 : Math.max(1, length|0);
		return new TestBed({
			title: "Zitzler-Deb-Thiele function 3",
			length: length,
			objectives: [-Infinity, -Infinity],
			minimumValue:  0,
			maximumValue: +1,
			evaluation: function evaluation(vs) {
				var f1 = vs[0],
					g = iterable(vs).tail().sum() / (vs.length - 1) * 9,
					h = 1 - Math.sqrt(f1 / g) - (f1 / g) * Math.sin(10 * Math.PI * f1);
				return [f1, g * h];
			}
		});
	}
}; // problems.testbeds
