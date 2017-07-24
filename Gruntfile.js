/** Gruntfile for [inveniemus.js](http://github.com/LeonardoVal/inveniemus.js).
*/
module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	});

	require('creatartis-grunt').config(grunt, {
		src: ['__prologue__',
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
			'__epilogue__'].map(function (n) { ////////////////////////////////////////////// Fin
				return 'src/'+ n +'.js';
			}),
		deps: [
			{	name: 'creatartis-base',
				path: 'node_modules/creatartis-base/build/creatartis-base.js',
				global: 'base'
			},
			{	name: 'sermat',
				path: 'node_modules/sermat/build/sermat-umd.js',
				global: 'Sermat'
			}
		]
	});

	grunt.registerTask('default', ['build']);
};
