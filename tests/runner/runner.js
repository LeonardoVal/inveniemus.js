﻿define(['creatartis-base', 'inveniemus'], function (base, inveniemus) {
	var runner = {};
	runner.base = base;
	runner.inveniemus = inveniemus;
// Set up log.
	base.Logger.ROOT.appendToConsole();
// Set up graphs.
	runner.run = function run() {
		var evaluationGraph = runner.evaluationGraph = new Dygraph(document.getElementById("chart"), [], {
			labels: ['step', 'minimum', 'average', 'maximum'],
			colors: ['red', 'black', 'blue'],
			width: $(window).width() * 0.9,
			drawPoints: true,
			customBars: true,
			showRoller: false,
			showRangeSelector: true, rangeSelectorHeight: 30,
			labelsDiv: "chart_legend", legend: "always"
		});
// Examples.
		var EXAMPLES = runner.EXAMPLES = {
			'Metaheuristic': { size: 100, steps: 100 },
			'metaheuristics.BeamSearch': { size: 20, steps: 50 },
			'metaheuristics.DifferentialEvolution': { size: 50, steps: 30 },
			'metaheuristics.DistributionEstimation': { size: 50, steps: 50 },
			'metaheuristics.EvolutionStrategy': { size: 10, steps: 30, mutantCount: 5 },
			'metaheuristics.GeneticAlgorithm': { mutationRate: 0.4, size: 100, steps: 50 },
			'metaheuristics.GradientDescent': { size: 1, steps: 20 },
			'metaheuristics.HarmonySearch': { size: 30, steps: 200 },
			'metaheuristics.HillClimbing': { delta: 0.1, steps: 100 },
			'metaheuristics.SimulatedAnnealing': { delta: 0.1, size: 20, maximumTemperature: 0.1 },
			'metaheuristics.ParticleSwarm': { size: 20, steps: 30 },			
		};
		var exampleSelect = $('select');
		exampleSelect.change(function () {
			var method = exampleSelect.val(),
				params = EXAMPLES[method], code;
			if (params) {
				code = 'function () {\n'+
					'\treturn new inveniemus.'+ method +'({\n'+
					'\t\tproblem: inveniemus.problems.testbeds.sumOptimization(10),\n'+
					Object.keys(params).map(function (name) {
						return '\t\t'+ name +': '+ params[name] +',\n';
					}).join('') +
					'\t});\n'+
					'}';
				$('#code').val(code);
			}
		});
		exampleSelect.change();
	// Run button.
		$('#run').click(function () {
			var graphData = [],
				runMinimum = Infinity,
				runMaximum = -Infinity,
				mh = runner.metaheuristic = eval('('+ $('#code').val() +')()');
			mh.events.on('advanced', function () {
				// Update evaluationGraph data with the run statistics.
				var graphStat = mh.problem.objectives.length > 1
					? mh.statistics.stat({key:'dominators', step: mh.step})
					: mh.statistics.stat({key:'evaluation', step: mh.step}),
					minimum = graphStat.minimum(),
					maximum = graphStat.maximum();
				graphData.push([
					mh.step, 
					[null, minimum, null],
					[minimum, graphStat.average(), maximum],
					[null, maximum, null]
				]);
				runMinimum = Math.min(runMinimum, minimum - Math.abs(minimum) * 0.1);
				runMaximum = Math.max(runMaximum, maximum + Math.abs(maximum) * 0.1);
				evaluationGraph.updateOptions({ 
					file: graphData,
					valueRange: [runMinimum, runMaximum]
				});
			});
			return mh.run().then(function (best) {
				return console.log(best);
			});
		}); // run button click
	};
	return runner;
}); // define