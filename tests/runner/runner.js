define(['creatartis-base', 'inveniemus'], function (base, inveniemus) {
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
			'metaheuristics.HillClimbing': { delta: 0.1, steps: 100 },
			'metaheuristics.GeneticAlgorithm': { mutationRate: 0.4, size: 100, steps: 50 },
			'metaheuristics.BeamSearch': { size: 20, steps: 50 },
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
					'\t\tproblem: new (inveniemus.problems.testbeds.sumOptimization(10))(),\n'+
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
				metaheuristic = runner.metaheuristic = metaheuristic = eval('('+ $('#code').val() +')()');
			metaheuristic.events.on('advanced', function () {
				// Update evaluationGraph data with the run statistics.
				var evaluationStats = metaheuristic.statistics.stat({key:'evaluation', step: metaheuristic.step}),
					minimum = evaluationStats.minimum(),
					maximum = evaluationStats.maximum();
				graphData.push([
					metaheuristic.step, 
					[null, minimum, null],
					[minimum, evaluationStats.average(), maximum],
					[null, maximum, null]
				]);
				runMinimum = Math.min(runMinimum, minimum - Math.abs(minimum) * 0.1);
				runMaximum = Math.max(runMaximum, maximum + Math.abs(maximum) * 0.1);
				evaluationGraph.updateOptions({ 
					file: graphData,
					valueRange: [runMinimum, runMaximum]
				});
			});
			return metaheuristic.run().then(function (best) {
				return console.log(best);
			});
		}); // run button click
	};
	return runner;
}); // define