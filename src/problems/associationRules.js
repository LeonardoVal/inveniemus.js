/** # Association rules.

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
var AssociationRule = problems.AssociationRule = declare(Element, {
	constructor: function AssociationRule(values) {
		Element.call(this, values);
	},
	
	// ## Evaluation ###############################################################################
	
	/** This method checks if the given `record` complies with this rule's `antecedent`. It is not
	implemented by default, so it should be overriden.
	*/
	antecedent: base.objects.unimplemented('AssociationRule', 'antecedent'),
	
	/** This method checks if the given `record` complies with this rule's `consequent`. It is not
	implemented by default, so it should be overriden.
	*/
	consequent: base.objects.unimplemented('AssociationRule', 'consequent'),
	
	/** Given a `dataset` (a sequence of records) the `measures` of this association rule
	include the usual statistics:
	
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
	measures: function measures(dataset) {
		var element = this,
			result = {},
			totalCount = 0, antecedentCount = 0, consequentCount = 0, ruleCount = 0;
		iterable(dataset).forEach(function (record) {
			if (element.antecedent(record)) {
				++antecedentCount;
				if (element.consequent(record)) {
					++consequentCount;
					++ruleCount;
				}
			} else if (element.consequent(record)) {
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
	`dataset` member. Measures are cached in `this.__measures__`.
	*/
	evaluate: function evaluate() {
		if (!this.__measures__) {
			this.__measures__ = this.measures(this.dataset);
		}
		this.evaluation = this.__measures__.confidence;
		return this.evaluation;
	},
	
	// ## Utilities ################################################################################

	/** The method `booleanRules` builds a representation for classic association rules, which treat
	each record as a set of `keys`. Each position in the element's values tells if the corresponding
	key belongs to the rule's antecedent or consequent; or neither. Empty antecedents and 
	consequents always evaluate to false.
	*/
	'static booleanRules': function booleanRules(keys) {
		var parent = this;
		return declare(parent, {
			length: keys.length,
			
			constructor: function (values) {
				parent.call(this, values);
				var aks = this.__antecedentKeys__ = [], // Cache rule's keys.
					cks = this.__consequentKeys__ = [];
				this.arrayMapping([0,1,2]).forEach(function (v, i) {
					switch (v) {
						case 1: aks.push(keys[i]); break;
						case 2: cks.push(keys[i]); break;
					}
				});
			},
			
			__checkKeys__: function __checkKeys__(keys, record) {
				return keys.length > 0 && iterable(keys).all(function (key) {
					return !!record[key];
				});
			},
			
			antecedent: function antecedent(record) {
				return this.__checkKeys__(this.__antecedentKeys__, record);
			},
			
			consequent: function consequent(record) {
				return this.__checkKeys__(this.__consequentKeys__, record);
			}
		});
	},
	
}); // declare AssociationRule.
