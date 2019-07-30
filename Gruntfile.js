/** Gruntfile for [inveniemus.js](http://github.com/LeonardoVal/inveniemus.js).
*/
module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	});

	require('@creatartis/creatartis-grunt').config(grunt, {
		sourceNames: ['__prologue__',
			'utilities',
			// Core /////////////////////////////////////////////////////////
			'Element', 
			'Problem',
			'Metaheuristic',
			// Metaheuristics ///////////////////////////////////////////////
			'metaheuristics/HillClimbing',
			'metaheuristics/GeneticAlgorithm',
			'metaheuristics/BeamSearch',
			'metaheuristics/SimulatedAnnealing',
			'metaheuristics/ParticleSwarm',
			'metaheuristics/DifferentialEvolution',
			'metaheuristics/EvolutionStrategy',
			'metaheuristics/HarmonySearch',
			'metaheuristics/DistributionEstimation',
			'metaheuristics/GradientDescent',
			// Test problems ////////////////////////////////////////////////
			'problems/HelloWorld',
			'problems/testbeds',
			'problems/NQueensPuzzle',
			'problems/KnapsackProblem',
			'problems/associationRules',
			'__epilogue__'],
		sourceMap: false, //FIXME
		deps: [
			{ id: 'creatartis-base', name: 'base' },
			{ id: 'sermat', name: 'Sermat', path: 'node_modules/sermat/build/sermat-umd.js' },
			{ id: 'dygraphs', path: 'node_modules/dygraphs/dist/dygraph.min.js',
		 		dev: true, module: false }
		],
		connect: {
			console: 'tests/console.html'
		}
	});

	grunt.registerTask('default', ['build']);
	grunt.registerTask('console', ['compile', 'connect:console']);
};
