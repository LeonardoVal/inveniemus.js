/** Gruntfile for [inveniemus.js](http://github.com/LeonardoVal/inveniemus.js).
*/
module.exports = function(grunt) {
	var SOURCE_FILES = ['src/__prologue__.js',
	// Core.
		'src/Element.js',
		'src/Problem.js',
		'src/Metaheuristic.js',
	// Metaheuristics.
		'src/metaheuristics/HillClimbing.js',
		'src/metaheuristics/GeneticAlgorithm.js', 
		'src/metaheuristics/BeamSearch.js',
		'src/metaheuristics/SimulatedAnnealing.js', 
	// Problems.
		'src/problems/SumOptimization.js',
		'src/problems/HelloWorld.js',
		'src/problems/NQueensPuzzle.js',
		'src/problems/KnapsackProblem.js',
	// Fin.
		'src/__epilogue__.js'];

	grunt.file.defaultEncoding = 'utf8';
// Init config. ////////////////////////////////////////////////////////////////
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat_sourcemap: { ////////////////////////////////////////////////////
			build: {
				src: SOURCE_FILES,
				dest: 'build/<%= pkg.name %>.js',
				options: {
					separator: '\n\n'
				}
			},
		},
		karma: { ///////////////////////////////////////////////////////////////
			options: {
				configFile: 'tests/karma.conf.js'
			},
			build: { browsers: ['PhantomJS'] },
			chrome: { browsers: ['Chrome'] },
			firefox: { browsers: ['Firefox'] },
			opera: { browsers: ['Opera'] },
			iexplore: { browsers: ['IE'] }
		},
		uglify: { //////////////////////////////////////////////////////////////
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
		docker: { //////////////////////////////////////////////////////////////
			build: {
				src: ["src/**/*.js", "README.md"],
				dest: "docs/docker",
				options: {
					colourScheme: 'borland',
					ignoreHidden: true,
					exclude: 'src/__prologue__.js,src/__epilogue__.js'
				}
			}
		},
		bowercopy: { ///////////////////////////////////////////////////////////
			options: {
				clean: true,
				runBower: true,
				srcPrefix: 'bower_components'
			},
			lib: {
				options: {
					destPrefix: 'lib'
				},
				files: {
					'jquery.js': 'jquery/jquery.js',
					'require.js': 'requirejs/require.js',
					'creatartis-base.js': 'creatartis-base/build/creatartis-base.js'
				},
			}
		}
	});
	
// Load plugins. ///////////////////////////////////////////////////////////////
	grunt.loadNpmTasks('grunt-concat-sourcemap');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-docker');
	grunt.loadNpmTasks('grunt-bowercopy');
	
// Custom tasks. ///////////////////////////////////////////////////////////////
	grunt.registerTask('bower-json', 'Writes <bower.json> based on <package.json>.', function() {
		var pkg = grunt.config.get('pkg'),
			bowerJSON = { // bower.json own members.
				"moduleType": ["amd", "globals", "node"],
				"authors": [pkg.author],
				"ignore": ["**/.*", "node_modules", "bower_components", "src", 
					"tests", "docs", "bower.json", "package.json", "Gruntfile.js", 
					"LICENSE.md", "README.md"],
				"dependencies": {
					"requirejs": "2.1.9",
					"creatartis-base": "git://github.com/LeonardoVal/creatartis-base.git"
				},
				"devDependencies": {
					"jquery": "~2.0.3",
					//"dygraphs": "~1.0.1" // Dygraphs bower package does not have the combined library.
				}
			};
		// Copy package.json members to bower.json.
		['name', 'description', 'version', 'keywords', 'licence', 'homepage',
		 'contributors', 'private', 'main', 'dependencies', 'devDependencies',
		 'optionalDependencies'].forEach(function (id) {
			if (pkg.hasOwnProperty(id) && !bowerJSON.hasOwnProperty(id)) {
				bowerJSON[id] = pkg[id];
			}
		});
		grunt.file.write('bower.json', JSON.stringify(bowerJSON, null, '\t'), { encoding: 'utf8' });
	}); // bower-json.
	
// Register tasks. /////////////////////////////////////////////////////////////
	grunt.registerTask('compile', ['concat_sourcemap:build', 'uglify:build']);
	grunt.registerTask('build', ['concat_sourcemap:build', 
		'karma:build', 'uglify:build', 'docker:build']);
	grunt.registerTask('default', ['build']);
	grunt.registerTask('test', ['concat_sourcemap:build', 'karma:build',
		'karma:chrome', 'karma:firefox', 'karma:opera', 'karma:iexplore']);
	grunt.registerTask('lib', ['bowercopy:lib']);
};