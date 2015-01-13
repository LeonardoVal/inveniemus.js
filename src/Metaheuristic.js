/**	# Metaheuristic

A [Metaheuristic](http://en.wikipedia.org/wiki/Metaheuristic) is an optimization algorithm (which 
can also be used for searching). This is the base class of all metaheuristic algorithms, and hence 
of all metaheuristic runs.
*/
var Metaheuristic = exports.Metaheuristic = declare({
	/** Each metaheuristic has its own `logger`, to track its process.
	*/
	logger: new Logger('inveniemus', Logger.ROOT, 'INFO'),
	
	/** The constructor takes a `params` object with the metaheuristic parameters. Although the 
	different algorithms have particular parameters of their own, some apply to all.
	*/
	constructor: function Metaheuristic(params) {
		initialize(this, params)
		/** First, the definition of the `problem` this metaheuristic is meant to solve.
		*/
			.object('problem', { defaultValue: null })
		/** The optimization's `size` is the amount of candidate solutions the metaheuristic treats 
		at each step. By default it is 100.
		*/
			.number('size', { defaultValue: 100, coerce: true })
		/** The `state` is the array that holds the elements this metaheuristic handles at each step.
		*/
			.array('state', { defaultValue: [] })
		/** All optimizations perform a certain number of iterations or `steps` (100 by default).
		*/
			.number('steps', { defaultValue: 100, coerce: true })
		/** The property `step` indicates the current iteration of this optimization, or a negative 
		number if it has not started yet.
		*/
			.integer('step', { defaultValue: -1, coerce: true })
		/** Most metaheuristic are stochastic processes, hence the need for a pseudo-random number 
		generator. By default `base.Randomness.DEFAULT` is used, yet it is strongly advised to 
		provide one.
		*/
			.object('random', { defaultValue: Randomness.DEFAULT })
		/** Metaheuristic's runs usually gather `statistics` about the process.
		*/
			.object('statistics', { defaultValue: new Statistics() })
			.object('logger', { ignore: true });
		this.events = new Events({ 
			events: ["initiated", "updated", "expanded", "evaluated", "sieved", 
				"advanced", "analyzed", "finished"]
		});
	},
	
	// ## Basic workflow ###########################################################################
	
	/**	`initiate(size=this.size)` builds and initiates this metaheuristic state with size new 
	cursors. The elements are build using the `initial()` function.
	*/
	initiate: function initiate(size) {
		size = isNaN(size) ? this.size : +size >> 0;
		this.state = new Array(size);
		for (var i = 0; i < size; i++) {
			this.state[i] = new this.problem.representation(); // Element with random values.
		}
		this.onInitiate();
	},
	
	/** `update()` updates this metaheuristic's state. It assumes the state has been initialized. 
	The process may be asynchronous, so it returns a future. The default implementation first 
	expands the state by calling `expand()`, then evaluates the added elements by calling 
	`evaluate()`, and finally removes the worst elements with `sieve()`.
	*/
	update: function update() {
		var mh = this;
		this.expand();
		return this.evaluate().then(function () {
			mh.sieve();
			mh.onUpdate();
			return mh;
		});
	},
	
	/** `expand(expansion=[])` adds to this metaheuristic's state the given expansion. If none is 
	given, `expansion()` is called to get new expansion.
	*/
	expand: function expand(expansion) {
		expansion = expansion || this.expansion();
		if (expansion.length < 1) {
			this.logger && this.logger.warn("Expansion is empty");
		} else {
			var expanded = this.state.concat(expansion),
				len = expanded.length;
			expanded = expanded.filter(function (elem, i) { // Trim equal elements from the expanded state.
				for (i++; i < len; i++) {
					if (elem.equals(expanded[i])) {
						return false;
					}
				}
				return true;
			});
			this.state = expanded;
		}
		this.onExpand();
	},
	
	/** `expansion(size)` returns an array of new elements to add to the current state. The default 
	implementation generates new random elements.		
	*/
	expansion: function expansion(size) {
		var expansionRate = isNaN(this.expansionRate) ? 0.5 : +this.expansionRate;
		size = isNaN(size) ? Math.floor(expansionRate * this.size) : +size;
		var elems = new Array(size), i;
		for (i = 0; i < size; i++){
			elems[i] = new this.problem.representation();
		}
		return elems;
	},
	
	/** `evaluate(elements)` evaluates all the elements in `state` with no evaluation, using its 
	evaluation method. After that sorts the state with the `compare` method of the problem. Returns 
	a future, regardless of the evaluation being asynchronous or not.
	*/
	evaluate: function evaluate(elements) {
		var mh = this,
			evalTime = this.statistics.stat({key:'evaluation_time'});
		evalTime.startTime();
		elements = elements || this.state;
		return Future.all(iterable(elements).filter(
			function (element) { // For those elements that don't have an evaluation, ...
				return isNaN(element.evaluation);
			},
			function (element) { // ... evaluate them.
				return Future.when(element.evaluate());
			}
		)).then(function (results) {
			elements.sort(mh.problem.compare.bind(mh.problem));
			evalTime.addTime();
			mh.onEvaluate(results);
			return elements;
		});
	},
	
	/** `sieve(size=this.size)` cuts the current state down to the given size (or this.size by 
	default). This is usually used after expanding and evaluating the state.
	*/
	sieve: function sieve(size) {
		size = isNaN(size) ? this.size : size | 0;
		if (this.state.length > size) {
			this.state = this.state.slice(0, this.size);
		}
		this.onSieve();
	},
	
	/** `finished()` termination criteria for this metaheuristic. By default it checks if the number 
	of passed iterations is not greater than `steps`.
	*/
	finished: function finished() {
		if (this.step >= this.steps || this.problem.suffices(this.state)) {
			return true;
		}
		return false;
	},

	/** `analyze()` updates the process' statistics.
	*/
	analyze: function analyze() {
		var stat = this.statistics.stat({key:'evaluation', step: this.step});
		this.state.forEach(function (element) {
			stat.add(element.evaluation, element);
		});
		this.onAnalyze();
		return stat;
	},
	
	/** `advance()` performs one step of the optimization. If the process has not been initialized, 
	it does so. Returns a future if the run has not finished or null otherwise.
	*/
	advance: function advance() {
		var mh = this, 
			stepTime = this.statistics.stat({key: 'step_time'}),
			result;
		if (isNaN(this.step) || +this.step < 0) {
			this.statistics.reset();
			stepTime.startTime();
			this.initiate();
			result = this.evaluate();
		} else {
			stepTime.startTime();
			result = this.update();
		}
		return result.then(function () {
			mh.step = isNaN(mh.step) || +mh.step < 0 ? 0 : +mh.step + 1;
			mh.analyze(); // Calculate the state's stats after updating it.
			stepTime.addTime();
			mh.onAdvance();
			return mh;
		});
	},
	
	/** `run()` returns a future that is resolved when the whole search process is finished. The 
	value is the best cursor after the last step.
	*/
	run: function run() {
		var mh = this, 
			advance = this.advance.bind(this);
		function continues() {
			return !mh.finished();
		}
		return Future.doWhile(advance, continues).then(function () {
			mh.onFinish();
			return mh.state[0]; // Return the best cursor.
		});
	},

	/** `reset()` reset the process to start over again. Basically cleans the statistics and sets 
	the current `step` to -1.
	*/
	reset: function reset() {
		this.step = -1;
		this.statistics.reset();
	},
	
	// ## State control ############################################################################
	
	/** The `nub` method eliminates repeated elements inside the state. Use responsibly, since this 
	is an expensive operation. Returns the size of the resulting state.
	*/
	nub: function nub(precision) {
		precision = isNaN(precision) ? 1e-15 : +precision;
		this.state = iterable(this.state).nub(function (e1, e2) {
			var values1 = e1.values,
				values2 = e2.values,
				len = values1.length;
			if (len !== e2.values.length) {
				return false;
			} else for (var i = 0; i < len; ++i) {
				if (Math.abs(values1[i] - values2[i]) > precision) {
					return false;
				}
			}
			return true;
		}).toArray();
		return this.state.length;
	},
	
	/** ## Events ##################################################################################
	
	For better customization the `events` handler emits the following events: 
		
	+ `initiated` when the state has been initialized.
	*/
	onInitiate: function onInitiate() {
		this.events.emit('initiated', this);
		this.logger && this.logger.debug('State has been initiated. Nos coepimus.');
	},
	
	/** + `updated` when the state has been expanded, evaluated and sieved.
	*/
	onUpdate: function onUpdate() {
		this.events.emit('updated', this);
		this.logger && this.logger.debug('State has been updated. Mutatis mutandis.');
	},
	
	/** + `expanded` after new elements are added to the state.
	*/
	onExpand: function onExpand() {
		this.events.emit('expanded', this);
		this.logger && this.logger.debug('State has been expanded. Nos exploramus.');
	},
	
	/** + `evaluated` after the elements in the state are evaluated.
	*/
	onEvaluate: function onEvaluate(elements) {
		this.events.emit('evaluated', this);
		this.logger && this.logger.debug('Evaluated and sorted ', elements.length, ' elements. Appretiatus sunt.');
	},
	
	/** + `sieved` after elements are removed from the state.
	*/
	onSieve: function onSieve() {
		this.events.emit('sieved', this);
		this.logger && this.logger.debug('State has been sieved. Haec est viam.');
	},
	
	/** + `advanced` when one full iteration is completed.
	*/
	onAdvance: function onAdvance() {
		this.events.emit('advanced', this);
		this.logger && this.logger.debug('Step ', this.step , ' has been completed. Nos proficimus.');
	},
	
	/** + `analyzed` after the statistics are calculated.
	*/
	onAnalyze: function onAnalyze() {
		this.events.emit('analyzed', this);
		this.logger && this.logger.debug('Statistics have been gathered. Haec sunt numeri.');
	},
	
	/** + `finished` when the run finishes.
	*/
	onFinish: function onFinish() {
		this.events.emit('finished', this);
		this.logger && this.logger.debug('Finished. Nos invenerunt!');
	},
	
	// ## Utilities ################################################################################
	
	/** The default string representation of a Metaheuristic shows its 
	constructor's name and its parameters.
	*/
	toString: function toString() {
		return (this.constructor.name || 'Metaheuristic') +"("+ JSON.stringify(this) +")";
	}	
}); // declare Metaheuristic.

/** `metaheuristics` is a bundle of available metaheuristics.
*/
var metaheuristics = exports.metaheuristics = {};