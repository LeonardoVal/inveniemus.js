/** inveniemus/src/problems/KnapsackProblem.js
	Many reference problems and related utilities are provided in this file.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
problems.KnapsackProblem = basis.declare(Problem, { ////////////////////////////
	title: "Knapsack problem",
	description: "Given a set of items with a cost and a worth, select a subset "+
		" maximizing the worth sum but not exceeding a cost limit.",
	
	/** problems.KnapsackProblem.items:
		The superset of all candidate solutions. Must be an object with each
		item by name. Each item must have a cost and a worth, and may have an
		amount (1 by default).
	*/
	items: {
		itemA: { cost: 12, worth:  4 }, 
		itemB: { cost:  2, worth:  2 }, 
		itemC: { cost:  1, worth:  2 }, 
		itemD: { cost:  1, worth:  1 },
		itemE: { cost:  4, worth: 10 }
	},
	
	/** new problems.KnapsackProblem(params):
		Classic combinatorial optimization problem, based on a given a set of 
		items, each with a cost and a worth. The solution is a subset of items
		with maximum worth sum that does not exceed a cost limit.
	*/	
	constructor: function NQueensPuzzle(params){
		Problem.call(this, params);
		basis.initialize(this, params)
			/** problems.KnapsackProblem.limit=15:
				Cost limit that candidate solution should not exceed.
			*/
			.number('limit', { coerce: true, defaultValue: 15 })
			/** problems.KnapsackProblem.defaultAmount=1:
				Amount available for each item by default.
			*/
			.integer('amount', { coerce: true, defaultValue: 1, minimum: 1 })
			.object('items', { ignore: true });
		
		// Ad hoc Element declaration.
		var problem = this;
		/** problems.KnapsackProblem.representation:
			The representation is an array with a number for each item. This
			number holds the selected amount for each item (from 0 up to the
			item's amount).
		*/
		this.representation = basis.declare(Element, {
			length: Object.keys(this.items).length,
			evaluate: function evaluate() {
				var selection = this.mapping(),
					worth = 0,
					cost = 0;
				Object.keys(selection).forEach(function (name) {
					var item = problem.items[name],
						amount = selection[name];
					worth += item.worth * amount;
					cost += item.cost * amount;
				});
				return this.evaluation = cost > problem.limit ? -worth : worth;
			},
			mapping: function mapping() {
				var selection = {},
					keys = Object.keys(problem.items);
				keys.sort();
				iterable(this.values).zip(keys).forEach(function (pair) {
					var item = problem.items[pair[1]],
						amount = pair[0] * (1 + (+item.amount || 1)) | 0;
					selection[pair[1]] = amount;
				});
				return selection;
			}
		});
	},
	
	compare: Problem.prototype.maximization
}); // declare KnapsackProblem