/** Gruntfile for [inveniemus.js](http://github.com/LeonardoVal/inveniemus.js).
*/
var path = require('path');

module.exports = function(grunt) {
	var SOURCE_FILES = ['__prologue__',
	// Core.
		'Element',
		'Problem',
		'Metaheuristic',
	// Metaheuristics.
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
	// Problems.
		'problems/HelloWorld',
		'problems/testbeds',
		'problems/NQueensPuzzle',
		'problems/KnapsackProblem',
		'problems/associationRules',
	// Fin.
		'__epilogue__'].map(function (n) {
			return 'src/'+ n +'.js';
		});

	grunt.file.defaultEncoding = 'utf8';
// Init config. ////////////////////////////////////////////////////////////////////////////////////
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: { ////////////////////////////////////////////////////////////////////////
			options: {
				separator: '\n\n',
				sourceMap: true
			},
			build: {
				src: SOURCE_FILES,
				dest: 'build/<%= pkg.name %>.js'
			}
		},
		jshint: { //////////////////////////////////////////////////////////////////////////////////
			build: {
				options: { // Check <http://jshint.com/docs/options/>.
					loopfunc: true,
					boss: true
				},
				src: ['build/<%= pkg.name %>.js', 'tests/specs/*.js'],
			},
		},
		copy: { ////////////////////////////////////////////////////////////////////////////////////
			test: {
				files: [
					'node_modules/requirejs/require.js',
					'node_modules/creatartis-base/build/creatartis-base.js', 'node_modules/creatartis-base/build/creatartis-base.js.map',
					'node_modules/sermat/build/sermat-umd.js', 'node_modules/sermat/build/sermat-umd.js.map',
					'build/<%= pkg.name %>.js', 'build/<%= pkg.name %>.js.map'
					].map(function (f) {
						return { nonull: true, src: f, dest: 'tests/lib/'+ path.basename(f) };
					})
			}
		},
		karma: { ///////////////////////////////////////////////////////////////////////////////////
			options: {
				configFile: 'tests/karma.conf.js'
			},
			build: { browsers: ['PhantomJS'] },
			chrome: { browsers: ['Chrome'] },
			firefox: { browsers: ['Firefox'] },
			iexplore: { browsers: ['IE'] }
		},
		uglify: { //////////////////////////////////////////////////////////////////////////////////
			build: {
				src: 'build/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js',
				options: {
					banner: '//! <%= pkg.name %> <%= pkg.version %>\n',
					report: 'min',
					sourceMap: true,
					sourceMapIn: 'build/<%= pkg.name %>.js.map',
					sourceMapName: 'build/<%= pkg.name %>.min.js.map'
				}
			}
		},
		docker: { //////////////////////////////////////////////////////////////////////////////////
			build: {
				src: ['src/**/*.js', 'README.md', 'docs/*.md'],
				dest: 'docs/docker',
				options: {
					colourScheme: 'borland',
					ignoreHidden: true,
					exclude: 'src/__prologue__.js,src/__epilogue__.js'
				}
			}
		}
	});
	
// Load plugins. ///////////////////////////////////////////////////////////////////////////////////
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-docker');
	
// Register tasks. /////////////////////////////////////////////////////////////////////////////////
	grunt.registerTask('compile', ['concat:build', 'jshint:build', 'uglify:build', 'copy:test']);
	grunt.registerTask('test', ['compile', 'karma:build']); 
	grunt.registerTask('test-all', ['test', 'karma:chrome', 'karma:firefox', 'karma:iexplore']);
	grunt.registerTask('build', ['test', 'docker:build']);
	grunt.registerTask('default', ['build']);
};