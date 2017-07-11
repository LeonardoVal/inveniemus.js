/** # Knapsack problem

The [Knapsack problem](http://en.wikipedia.org/wiki/Knapsack_problem) is a classic combinatorial
optimization problem. Given a set of items, each with cost and worth, a selection must be obtained
(to go into the knapsack) so that the total cost does not exceed a certain limit, while maximizing
the total worth.
*/
problems.KnapsackProblem = declare(Problem, {
	title: "Knapsack problem",
	description: "Given a set of items with a cost and a worth, select a subset "+
		" maximizing the worth sum but not exceeding a cost limit.",

	/** `items` is the superset of all candidate solutions. Must be an object with each item by
	name. Each item must have a cost and a worth, and may have an amount (1 by default).
	*/
	items: {
		itemA: { cost: 12, worth:  4 },
		itemB: { cost:  2, worth:  2 },
		itemC: { cost:  1, worth:  2 },
		itemD: { cost:  1, worth:  1 },
		itemE: { cost:  4, worth: 10 }
	},

	/** The problem is based on a given a set of items, each with a cost and a worth. The solution
	is a subset of items with maximum worth sum that does not exceed a cost limit.

	The parameters specific for this problem are:
	*/
	constructor: function KnapsackProblem(params) {
		initialize(this, params)
			/** + `limit=15` is the cost limit that candidate solution should not exceed.
			*/
			.number('limit', { coerce: true, defaultValue: 15 })
			/** + `defaultAmount=1` is the amount available for each item by default.
			*/
			.integer('amount', { coerce: true, defaultValue: 1, minimum: 1 })
			/** + `items` is the set of items.
			*/
			.object('items', { ignore: true });
		/** The problem's representation is an array with a number for each item, in alphabetical
		order. Each number holds the selected amount for each item (from 0 up to the item's
		amount).
		*/
		var items = this.items;
		this.__elementItems__ = Object.keys(items);
		this.__elementItems__.sort();
		Problem.call(this, base.copy({
				/** The best selection of items is the one that maximizes worth, without
				exceeding the cost limit.
				*/
				objective: +Infinity,
				elementModel: this.__elementItems__.map(function (name) {
					return { n: +items[name].amount || 1 };
				})
			}, params));
	},

	/** All elements are mapped to an object with the selected amount associated to each item.
	*/
	mapping: function mapping(element) {
		return iterable(this.__elementItems__).zip(element.values()).toObject();
	},

	/** All elements are evaluated by calculating the worth of all included items. If their cost is
	greater than the problem's limit, the worth becomes negative.
	*/
	evaluation: function evaluation(element) {
		var selection = this.mapping(element),
			items = this.items,
			worth = 0,
			cost = 0;
		iterable(selection).forEachApply(function (name, amount) {
			var item = items[name];
			worth += item.worth * amount;
			cost += item.cost * amount;
		});
		return cost > problem.limit ? -worth : worth; //FIXME Too punishing for going over the limit.
	},

	// ## Utilities ################################################################################

	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'KnapsackProblem',
		serializer: function serialize_KnapsackProblem(obj) {
			return [obj.__params__('limit', 'amount', 'items')];
		}
	}
}); // declare KnapsackProblem
