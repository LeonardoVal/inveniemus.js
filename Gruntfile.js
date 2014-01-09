/** Gruntfile for inveniemus.
	
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

var sourceFiles = [ 'src/Element.js', 'src/Problem.js', 'src/Metaheuristic.js',
	'src/metaheuristics/HillClimbing.js', 'src/metaheuristics/GeneticAlgorithm.js', 
		'src/metaheuristics/BeamSearch.js', 'src/metaheuristics/SimulatedAnnealing.js', 
	'src/problems/SumOptimization.js', 'src/problems/HelloWorld.js',
		'src/problems/NQueensPuzzle.js', 'src/problems/KnapsackProblem.js'
];

module.exports = function(grunt) {
// Init config. ////////////////////////////////////////////////////////////////
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: { //////////////////////////////////////////////////////////////
			options: {
				separator: '\n\n',
				banner: '"use strict"; ('+ umdWrapper +')(function (basis){ var exports = {};\n',
				footer: '\nreturn exports;\n});'
			},
			build: {
				src: sourceFiles,
				dest: './<%= pkg.name %>.js',
			},
		},
		uglify: { //////////////////////////////////////////////////////////////
		  options: {
			banner: '//! <%= pkg.name %> <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n',
			report: 'min'
		  },
		  build: {
			src: './<%= pkg.name %>.js',
			dest: './<%= pkg.name %>.min.js'
		  }
		},
		docgen: { //////////////////////////////////////////////////////////////
			build: {
				src: sourceFiles,
				dest: 'docs/api.md'
			}
		},
		markdown: { ////////////////////////////////////////////////////////////
			build: {
				files: [ {
					expand: true,
					src: 'docs/*.md',
					ext: '.html'
				}]
			}
		}
	});

// Load tasks. /////////////////////////////////////////////////////////////////
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-markdown');
	
// Documentation. //////////////////////////////////////////////////////////////
	function formatDocComment(text) {
		text = text.trim();
		text = text.replace(/\s*\n\s+/g, '\n');
		text = text.replace(/\.\n/g, '.\n\n');
		text = text.replace(/^(.*?):\n/g, '### `$1`:\n\n');
		text = text.replace(/\n@(\w+)\s+([^\n]+)/g, '\n* $1: $2\n');
		return text;
	}
	
	grunt.registerMultiTask('docgen', 'Extract and concatenate documentation comments.', function() {
		var options = this.options({
			prologue: '# Source documentation for [<%= pkg.name %>](<%= pkg.repository.url %>)\n\n<%= pkg.description %>',
			epilogue: '---\n\nBy [<%= pkg.author.name %>](<%= pkg.author.email %>). Generated <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>.'
		});
		var prologue = grunt.template.process(options.prologue),
			epilogue = grunt.template.process(options.epilogue),
			docCommentRegExp = /\/\*\*(([^*]|\*+[^\/])*)\*+\//g;
		this.files.forEach(function (file) {
			var content = prologue +'\n\n'+ file.src.filter(function (path) {
				return grunt.file.exists(path);
			}).map(function (path) {
				var input = grunt.file.read(path), 
					output = '## `'+ path +'`\n\n';
				input.replace(docCommentRegExp, function () {
					output += formatDocComment(arguments[1]) +'\n';
					return '';
				});
				return output;
			}).join('\n') +'\n\n'+ epilogue;
			grunt.file.write(file.dest, content);
			grunt.log.writeln('Written ' + file.dest + '.');
		});
	});
	
// Register tasks. /////////////////////////////////////////////////////////////
	grunt.registerTask('default', ['concat', 'uglify', 'docgen', 'markdown']);
};