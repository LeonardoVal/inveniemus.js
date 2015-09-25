/** # Association rules learning.

Association rules are relations between variables found in databases. Many methods have been 
researched to automatically search for interesting rules in large data sets.

For further information, see:

+ Agrawal, R.; Imieliński, T.; Swami, A. [_"Mining association rules between sets of items in large 
	databases"_](http://dl.acm.org/citation.cfm?doid=170035.170072). Proceedings of the 1993 ACM 
	SIGMOD international conference on Management of data.
	
+ Sergey Brin, Rajeev Motwani, Jeffrey D. Ullman, and Shalom Tsur. [_"Dynamic itemset counting and 
	implication rules for market basket data"_](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.25.3707).
	SIGMOD 1997, Proceedings ACM SIGMOD International Conference on Management of Data.
*/
var AssociationRuleLearning = problems.AssociationRuleLearning = declare(Problem, {
	/** The constructors take the following parameters:
	*/
	constructor: function AssociationRuleLearning(params) {
		Problem.call(this, params);
		initialize(this, params)
			/** + A `dataset` with which to test the association rules. It must be a sequence of
			records (each an object).
			*/
			.object('dataset', { defaultValue: [] })
			/** + A set of `keys` for the fields in the dataset.
			*/
			.array('keys');
		/** The elements represent classic association rules, which treat each record as a set of 
		`keys`. Each position in the element's values tells if the corresponding key belongs to the 
		rule's antecedent or consequent; or neither. Empty antecedents and consequents always 
		evaluate to false.
		*/
		this.__elementModel__ = Iterable.repeat({ min: 0, max: 2, discrete: true }, this.keys.length).toArray();
	},
	
	// ## Evaluation ###############################################################################
	
	/** Turns the element into an association rule, i.e. an object with two disjunct sets of keys:
	one for the antecedent and the other for the consequent.
	*/
	mapping: function mapping(element) {
		var problem = this,
			antecedent = [], 
			consequent = [];
		element.values.forEach(function (v, i) {
			switch (v) {
				case 1: antecedent.push(problem.keys[i]); break;
				case 2: consequent.push(problem.keys[i]); break;
			}
		});
		return { antecedent: antecedent, consequent: consequent };
	},
	
	keysComply: function keysComply(keys, record) {
		var it = iterable(keys);
		return !it.isEmpty() && it.all(function (key) {
			return !!record[key];
		});
	},
	
	/** This method checks if the given `record` complies with the given `rule`'s `antecedent`.
	*/
	antecedentComplies: function antecedentComplies(rule, record) {
		return this.keysComply(rule.antecedent, record);
	},
	
	/** This method checks if the given `record` complies with the given `rule`'s `consequent`.
	*/
	consequentComplies: function consequentComplies(rule, record) {
		return this.keysComply(rule.consequent, record);
	},
	
	/** The `measures` of an `element` (representing an association rule) include the usual 
	statistics:
	
	+ `antecedentCount`, `consequentCount`, `ruleCount` are the numbers of records that comply with
		this rules's antecedent, consequent and both.
	+ `antecedentSupport`, `consequentSupport`, `ruleSupport` are the same numbers as before but 
		divided by the total number of records.
	+ `confidence` can be interpreted as an estimation of _P(C|A)_ for rules _A -> C_.
	+ `lift` is the ratio of the observed support to that expected if A and C were independent.
	+ `conviction` is the ratio of the expected frequency that A occurs without C.
	+ `leverage` measures the difference of A and C appearing together in the data set and what 
		would be expected if X and Y where statistically dependent.
	*/
	measures: function measures(element) {
		var problem = this,
			result = {},
			totalCount = 0, 
			antecedentCount = 0, 
			consequentCount = 0, 
			ruleCount = 0,
			rule = this.mapping(element);
		iterable(this.dataset).forEach(function (record) {
			if (problem.antecedentComplies(rule, record)) {
				++antecedentCount;
				if (problem.consequentComplies(rule, record)) {
					++consequentCount;
					++ruleCount;
				}
			} else if (problem.consequentComplies(rule, record)) {
				++consequentCount;
			}
			++totalCount;
		});
		result.antecedentCount = antecedentCount;
		result.consequentCount = consequentCount;
		result.ruleCount = ruleCount;
		result.antecedentSupport = totalCount > 0 ? antecedentCount / totalCount : 0;
		result.consequentSupport = totalCount > 0 ? consequentCount / totalCount : 0;
		result.ruleSupport = totalCount > 0 ? ruleCount / totalCount : 0;
		result.confidence = antecedentCount > 0 ? ruleCount / antecedentCount : 0;
		result.lift = result.consequentSupport > 0 ? result.confidence / result.consequentSupport : 0;
		result.conviction = result.consequentSupport > 0 && result.confidence < 1 ? (1 - result.consequentSupport) / (1 - result.confidence) : 0;
		result.leverage = result.ruleSupport - result.antecedentSupport * result.consequentSupport;
		return result;
	}, 
	
	/** By default, the evaluation uses the rule's confidence. It assumes the elements has a 
	`dataset` member. Measures are cached in a `__measures__` property in the element.
	*/
	evaluation: function evaluation(element) {
		if (!element.__measures__) {
			element.__measures__ = this.measures(element);
		}
		return element.__measures__.confidence;
	}	
}); // declare AssociationRule.