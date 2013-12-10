/** Gruntfile for basis.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
var umdWrapper = function (init) {
	if (typeof define === 'function' && define.amd) {
		define(['basis'], init); // AMD module.
	} else if (typeof module === 'object' && module.exports) {
		module.exports = init(require('basis')); // CommonJS module.
	} else {
		var global = (0, eval)('this');
		global.inveniemus = init(global.basis); // Global namespace.
	}
};

module.exports = function(grunt) {
// Init config. ////////////////////////////////////////////////////////////////
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: '\n\n',
				banner: '"use strict"; ('+ umdWrapper +')(function (basis){ var exports = {};\n',
				footer: '\nreturn exports;\n});'
			},
			build: {
				src: [
					'src/Element.js', 
					'src/Problem.js', 
					'src/Metaheuristic.js',
					'src/metaheuristics/HillClimbing.js', 
					'src/metaheuristics/GeneticAlgorithm.js',
					'src/problems/SumOptimization.js',
					'src/problems/HelloWorld.js',
					'src/problems/NQueensPuzzle.js',
					'src/problems/KnapsackProblem.js'
				],
				dest: './<%= pkg.name %>.js',
			},
		},
		uglify: {
		  options: {
			banner: '//! <%= pkg.name %> <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n',
			report: 'min'
		  },
		  build: {
			src: './<%= pkg.name %>.js',
			dest: './<%= pkg.name %>.min.js'
		  }
		}
	});

// Load tasks. /////////////////////////////////////////////////////////////////
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');

// Register tasks. /////////////////////////////////////////////////////////////
	grunt.registerTask('default', ['concat', 'uglify']);
};