/** inveniemus/src/Metaheuristic.js
	A Metaheuristic is usually an optimization algorithm (which can also be used
	for searching).
	See <http://en.wikipedia.org/wiki/Metaheuristic>.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Metaheuristic base class ////////////////////////////////////////////////////

var Metaheuristic = exports.Metaheuristic = basis.declare({
	/** Metaheuristic.logger:
		Logger used by the metaheuristic.
	*/
	logger: new basis.Logger('inveniemus', basis.Logger.ROOT, 'INFO'),
	
	/** new Metaheuristic(params):
		Base class of all metaheuristic algorithms, and hence of all 
		metaheuristic runs.
	*/
	constructor: function Metaheuristic(params) {
		basis.initialize(this, params)
		/** Metaheuristic.problem:
			Definition of the problem this metaheuristic will try to solve.
		*/
			.object('problem', { defaultValue: null })
		/** Metaheuristic.size=100:
			Amount of candidate solutions the metaheuristic treats at each step.
		*/
			.number('size', { defaultValue: 100, coerce: true })
		/** Metaheuristic.state=[]:
			An array holding the elements this metaheuristic handles at each
			step.
		*/
			.array('state', { defaultValue: [] })
		/** Metaheuristic.steps=100:
			Number of steps this metaheuristic must perform.
		*/
			.number('steps', { defaultValue: 100, coerce: true })
		/** Metaheuristic.step=-1:
			Current iteration of this metaheuristic, or a negative number if
			it has not started yet.
		*/
			.integer('step', { defaultValue: -1, coerce: true })
		/** Metaheuristic.random=Randomness.DEFAULT:
			This metaheuristic's pseudorandom number generator. It is strongly
			advised to have only one for the whole process.
		*/
			.object('random', { defaultValue: __DEFAULT_RANDOM__ })
		/** Metaheuristic.statistics:
			The statistic gatherer for this metaheuristic.
		*/
			.object('statistics', { defaultValue: new basis.Statistics() })
			.object('logger', { ignore: true });
		/** Metaheuristic.events:
			Event handler for this metaheuristic. Emitted events are: initiated,
			expanded, evaluated, sieved, advanced, analyzed & finished.
		*/
		this.events = new basis.Events({ 
			events: "initiated expanded evaluated sieved advanced analyzed finished".split(' ')
		});
	},
	
	// Basic workflow. /////////////////////////////////////////////////////////
	
	/**	Metaheuristic.initiate(size=this.size):
		Builds and initiates this metaheuristic state with size new cursors. The
		elements are build using the initial() function.
	*/
	initiate: function initiate(size) {
		size = isNaN(size) ? this.size : +size >> 0;
		this.state = new Array(size);
		for (var i = 0; i < size; i++) {
			this.state[i] = new this.problem.representation(); // Element with random values.
		}
		this.events.emit('initiated', this);
		this.logger && this.logger.debug('State has been initiated. Nos coepimus.');
	},
	
	/** Metaheuristic.expand(expansion):
		Adds to this metaheuristic's state the given expansion. If none is given,
		this.expansion() is called to get new expansion.
	*/
	expand: function expand(expansion) {
		expansion = expansion || this.expansion();
		if (expansion.length < 1) {
			this.logger && this.logger.warn("Expansion is empty");
		} else {
			var expanded = this.state.concat(expansion),
				len = expanded.length;
			// Trim equal elements from the expanded state.
			expanded = expanded.filter(function (elem, i) {
				for (i++; i < len; i++) {
					if (elem.equals(expanded[i])) {
						return false;
					}
				}
				return true;
			});
			this.state = expanded;
		}
		this.events.emit('expanded', this);
		this.logger && this.logger.debug('State has been expanded. Nos exploramus.');
	},
	
	/** Metaheuristic.expansion(size):
		Returns an array of new elements to add to the current state. The 
		default implementation generates new random elements.		
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
	
	/** Metaheuristic.evaluate():
		Evaluates all the elements in this.state with no evaluation, using its
		evaluation method. After that sorts the state with the compare method
		of the problem.
		Returns a Future, regardless of the evaluation being asynchoronous or 
		not.
	*/
	evaluate: function evaluate(cursors) {
		var mh = this;
		this.statistics.startTime('time_evaluation');
		return basis.Future.all(iterable(this.state).filter(
			function (element) { // For those elements that don't have an evaluation, ...
				return isNaN(element.evaluation);
			},
			function (element) { // ... evaluate them.
				return basis.when(element.evaluate());
			}
		)).then(function (results) {
			mh.state.sort(mh.problem.compare.bind(mh.problem));
			mh.statistics.addTime('time_evaluation');
			mh.events.emit('evaluated', this);
			mh.logger && mh.logger.debug('Evaluated and sorted ', results.length, ' elements. Appretiatus sunt.');
			return mh;
		});
	},
	
	/** Metaheuristic.prototype.sieve(size=this.size):
		Cuts the current state down to the given size (or this.size by default).
		This is usually used after expanding and evaluating the state. The
		statistics of this metaheuristic are calculated here, right after the
		state is sieved.
	*/
	sieve: function sieve(size) {
		size = isNaN(size) ? this.size : size | 0;
		if (this.state.length > size) {
			this.state = this.state.slice(0, this.size);
		}
		this.events.emit('sieved', this);
		this.logger && this.logger.debug('State has been sieved. Viam selectus est.');
	},
	
	/** Metaheuristic.finished():
		Termination criteria for this metaheuristic. By default it checks if the
		number of passed iterations is not greater than this.steps.
	*/
	finished: function finished() {
		if (this.step >= this.steps || this.problem.suffices(this.state)) {
			this.events.emit('finished', this);
			return true;
		}
		return false;
	},

	/** Metaheuristic.analyze():
		Updates the process' statistics.
	*/
	analyze: function analyze() {
		var stat = this.statistics.stat(['evaluation', 'step='+ this.step]);
		this.state.forEach(function (element) {
			stat.add(element.evaluation, element);
		});
		this.events.emit('analyzed', this);
		return stat;
	},
	
	/** Metaheuristic.advance():
		Performs one step of the optimization. If the process has not been 
		initialized, it does so. Returns a Future if the run has not finished or 
		null otherwise.
	*/
	advance: function advance() {
		var mh = this;
		if (this.step < 0) {
			this.statistics.reset();
			this.statistics.startTime('time_step');
			this.initiate();
		} else {
			this.statistics.startTime('time_step');
			this.expand();
		}
		return this.evaluate().then(function () {
			mh.sieve();
			mh.step = Math.max(0, mh.step + 1);
			mh.analyze(); // Calculate the state stats after sieving it.
			mh.statistics.addTime('time_step');
			mh.events.emit('advanced', this);
			mh.logger && mh.logger.info('Step ', mh.step , ' has been completed. Nos proficimus.');
			return mh;
		});
	},
	
	/** Metaheuristic.run():
		Returns a Future that is resolved when the whole search process is 
		finished. The value is the best cursor after the last step.
	*/
	run: function run() {
		var mh = this, 
			advance = this.advance.bind(this);
		function continues() {
			return !mh.finished();
		}
		return basis.Future.doWhile(advance, continues).then(function () {
			mh.logger && mh.logger.info('Finished. Nos invenerunt!');
			return mh.state[0]; // Return the best cursor.
		});
	},

	/** Metaheuristic.reset():
		Reset the process to start over again. Basically cleans the stats and 
		sets the current step to -1.
	*/
	reset: function reset() {
		this.step = -1;
		this.statistics.reset();
	},
	
	// Utility methods. ////////////////////////////////////////////////////////
	
	toString: function toString() {
		return (this.constructor.name || 'Metaheuristic') +"("+ JSON.stringify(this) +")";
	}	
}); // declare Metaheuristic.

/** metaheuristics:
	Bundle of metaheuristics available.
*/
var metaheuristics = exports.metaheuristics = {};