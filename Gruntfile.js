/** Gruntfile for [inveniemus.js](http://github.com/LeonardoVal/inveniemus.js).
*/
module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	});

	require('creatartis-grunt').config(grunt, {
		sourceNames: ['__prologue__',
			'utilities',
			'Element', ///////////////////////////////////////////////////////////////////// Core
			'Problem',
			'Metaheuristic',
			'metaheuristics/HillClimbing', /////////////////////////////////////// Metaheuristics
			'metaheuristics/GeneticAlgorithm',
			'metaheuristics/BeamSearch',
			'metaheuristics/SimulatedAnnealing',
			'metaheuristics/ParticleSwarm',
			'metaheuristics/DifferentialEvolution',
			'metaheuristics/EvolutionStrategy',
			'metaheuristics/HarmonySearch',
			'metaheuristics/DistributionEstimation',
			'metaheuristics/GradientDescent',
			'problems/HelloWorld', ///////////////////////////////////////////////////// Problems
			'problems/testbeds',
			'problems/NQueensPuzzle',
			'problems/KnapsackProblem',
			'problems/associationRules',
			'__epilogue__'],
		deps: [
			{ id: 'creatartis-base', name: 'base' },
			{ id: 'sermat', name: 'Sermat', path: 'node_modules/sermat/build/sermat-umd.js' },
			{ id: 'dygraphs', path: 'node_modules/dygraphs/dist/dygraph.min.js',
		 		dev: true, module: false }
		]
	});

	grunt.registerTask('default', ['build']);
};
